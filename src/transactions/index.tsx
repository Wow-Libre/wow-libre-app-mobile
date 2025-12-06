import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import {
  getTransactions,
  getTransactionReferenceNumber,
  Transaction,
} from '../api/internal/index';
import {getJWT} from '../services/storage';
import {Images} from '../constant';

const TransactionsScreen = ({navigation}: {navigation: any}): React.JSX.Element => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const loadTransactions = async (pageNum: number = 0, refresh: boolean = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const jwt = await getJWT();
      if (!jwt) {
        Alert.alert('Error', 'No se encontró la sesión. Por favor inicia sesión nuevamente.');
        navigation.navigate('Login');
        return;
      }

      const result = await getTransactions(jwt, pageNum, 10);
      
      if (refresh || pageNum === 0) {
        setTransactions(result.transactions);
      } else {
        setTransactions(prev => [...prev, ...result.transactions]);
      }

      setHasMore(result.transactions.length === 10);
    } catch (error: any) {
      console.error('Error al cargar transacciones:', error);
      Alert.alert(
        'Error',
        error?.message || 'No se pudieron cargar las transacciones. Por favor intenta de nuevo.',
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadTransactions(0);
  }, []);

  const onRefresh = () => {
    setPage(0);
    loadTransactions(0, true);
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadTransactions(nextPage);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      }).format(price);
    }
    return `${price.toLocaleString()} ${currency}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'approved':
        return '#10b981';
      case 'pending':
      case 'processing':
        return '#f59e0b';
      case 'failed':
      case 'rejected':
      case 'cancelled':
        return '#ef4444';
      default:
        return '#9ca3af';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'Completada';
      case 'approved':
        return 'Aprobada';
      case 'pending':
        return 'Pendiente';
      case 'processing':
        return 'Procesando';
      case 'failed':
        return 'Fallida';
      case 'rejected':
        return 'Rechazada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const handleTransactionPress = async (transaction: Transaction) => {
    try {
      setIsLoadingDetail(true);
      setIsDetailModalVisible(true);
      const jwt = await getJWT();
      if (!jwt) {
        Alert.alert('Error', 'No se encontró la sesión. Por favor inicia sesión nuevamente.');
        navigation.navigate('Login');
        return;
      }

      const detail = await getTransactionReferenceNumber(
        jwt,
        transaction.reference_number,
      );
      setSelectedTransaction(detail);
    } catch (error: any) {
      console.error('Error al cargar detalle de transacción:', error);
      Alert.alert(
        'Error',
        error?.message || 'No se pudo cargar el detalle de la transacción.',
      );
      setIsDetailModalVisible(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const renderTransaction = (transaction: Transaction) => {
    const statusColor = getStatusColor(transaction.status);
    const statusText = getStatusText(transaction.status);

    return (
      <TouchableOpacity
        key={transaction.id}
        style={styles.transactionCard}
        activeOpacity={0.8}
        onPress={() => handleTransactionPress(transaction)}>
        <View style={styles.transactionHeader}>
          <View style={styles.transactionImageContainer}>
            <Image
              source={{
                uri: transaction.logo || transaction.product_id?.image_url || Images.WOW_ICON,
              }}
              style={styles.transactionImage}
              resizeMode="cover"
              defaultSource={{
                uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/WoW_icon.svg/1200px-WoW_icon.svg.png',
              }}
            />
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionProductName} numberOfLines={2}>
              {transaction.product_name || transaction.product_id?.name || 'Producto'}
            </Text>
            <Text style={styles.transactionDate}>
              {formatDate(transaction.creation_date)}
            </Text>
            <Text style={styles.transactionReference}>
              Ref: {transaction.reference_number}
            </Text>
          </View>
          <View style={styles.transactionRight}>
            <View style={[styles.statusBadge, {backgroundColor: statusColor}]}>
              <Text style={styles.statusText}>{statusText}</Text>
            </View>
            <Text style={styles.transactionPrice}>
              {formatPrice(transaction.price, transaction.currency)}
            </Text>
          </View>
        </View>
        {transaction.progress !== undefined && transaction.progress < 100 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {width: `${transaction.progress}%`},
                ]}
              />
            </View>
            <Text style={styles.progressText}>{transaction.progress}%</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading && transactions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}>
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Transacciones</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e88e5" />
          <Text style={styles.loadingText}>Cargando transacciones...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Transacciones</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        onScroll={({nativeEvent}) => {
          const {layoutMeasurement, contentOffset, contentSize} = nativeEvent;
          const paddingToBottom = 20;
          if (
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom
          ) {
            loadMore();
          }
        }}
        scrollEventThrottle={400}>
        {transactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No hay transacciones</Text>
            <Text style={styles.emptySubtext}>
              Tus transacciones aparecerán aquí
            </Text>
          </View>
        ) : (
          <>
            {transactions.map(transaction => renderTransaction(transaction))}
            {isLoading && hasMore && (
              <View style={styles.loadingMoreContainer}>
                <ActivityIndicator size="small" color="#1e88e5" />
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Transaction Detail Modal */}
      <Modal
        visible={isDetailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setIsDetailModalVisible(false);
          setSelectedTransaction(null);
        }}>
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {isLoadingDetail ? (
              <View style={styles.modalLoadingContainer}>
                <ActivityIndicator size="large" color="#1e88e5" />
                <Text style={styles.modalLoadingText}>
                  Cargando detalle...
                </Text>
              </View>
            ) : selectedTransaction ? (
              <>
                {/* Close Button */}
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => {
                    setIsDetailModalVisible(false);
                    setSelectedTransaction(null);
                  }}
                  activeOpacity={0.7}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
                <ScrollView
                  style={styles.modalScrollView}
                  contentContainerStyle={styles.modalScrollContent}
                  showsVerticalScrollIndicator={false}>
                  {/* Transaction Image */}
                  <View style={styles.detailImageContainer}>
                  <Image
                    source={{
                      uri:
                        selectedTransaction.logo ||
                        selectedTransaction.product_id?.image_url ||
                        Images.WOW_ICON,
                    }}
                    style={styles.detailImage}
                    resizeMode="cover"
                    defaultSource={{
                      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/WoW_icon.svg/1200px-WoW_icon.svg.png',
                    }}
                  />
                </View>

                {/* Transaction Info */}
                <View style={styles.detailInfo}>
                  <Text style={styles.detailTitle}>
                    {selectedTransaction.product_name ||
                      selectedTransaction.product_id?.name ||
                      'Producto'}
                  </Text>

                  {/* Status */}
                  <View style={styles.detailStatusContainer}>
                    <View
                      style={[
                        styles.detailStatusBadge,
                        {backgroundColor: getStatusColor(selectedTransaction.status)},
                      ]}>
                      <Text style={styles.detailStatusText}>
                        {getStatusText(selectedTransaction.status)}
                      </Text>
                    </View>
                  </View>

                  {/* Price */}
                  <View style={styles.detailPriceContainer}>
                    <Text style={styles.detailPriceLabel}>Precio:</Text>
                    <Text style={styles.detailPrice}>
                      {formatPrice(
                        selectedTransaction.price,
                        selectedTransaction.currency,
                      )}
                    </Text>
                  </View>

                  {/* Details */}
                  <View style={styles.detailSection}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Referencia:</Text>
                      <Text style={styles.detailValue}>
                        {selectedTransaction.reference_number}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Fecha:</Text>
                      <Text style={styles.detailValue}>
                        {formatDate(selectedTransaction.creation_date)}
                      </Text>
                    </View>
                    {selectedTransaction.payment_method && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Método de Pago:</Text>
                        <Text style={styles.detailValue}>
                          {selectedTransaction.payment_method}
                        </Text>
                      </View>
                    )}
                    {selectedTransaction.reference_payment && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>
                          Referencia de Pago:
                        </Text>
                        <Text style={styles.detailValue}>
                          {selectedTransaction.reference_payment}
                        </Text>
                      </View>
                    )}
                    {selectedTransaction.credit_points !== undefined && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Puntos de Crédito:</Text>
                        <Text style={styles.detailValue}>
                          {selectedTransaction.credit_points ? 'Sí' : 'No'}
                        </Text>
                      </View>
                    )}
                    {selectedTransaction.subscription !== undefined && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Suscripción:</Text>
                        <Text style={styles.detailValue}>
                          {selectedTransaction.subscription ? 'Sí' : 'No'}
                        </Text>
                      </View>
                    )}
                    {selectedTransaction.send !== undefined && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Enviado:</Text>
                        <Text style={styles.detailValue}>
                          {selectedTransaction.send ? 'Sí' : 'No'}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Product Details */}
                  {selectedTransaction.product_id && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>
                        Información del Producto
                      </Text>
                      {selectedTransaction.product_id.description && (
                        <Text style={styles.detailDescription}>
                          {selectedTransaction.product_id.description}
                        </Text>
                      )}
                      {selectedTransaction.product_id.disclaimer && (
                        <Text style={styles.detailDisclaimer}>
                          {selectedTransaction.product_id.disclaimer}
                        </Text>
                      )}
                      {selectedTransaction.product_id.product_category_id && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Categoría:</Text>
                          <Text style={styles.detailValue}>
                            {
                              selectedTransaction.product_id.product_category_id
                                .name
                            }
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Progress */}
                  {selectedTransaction.progress !== undefined &&
                    selectedTransaction.progress < 100 && (
                      <View style={styles.detailSection}>
                        <Text style={styles.detailSectionTitle}>Progreso</Text>
                        <View style={styles.detailProgressContainer}>
                          <View style={styles.detailProgressBar}>
                            <View
                              style={[
                                styles.detailProgressFill,
                                {
                                  width: `${selectedTransaction.progress}%`,
                                },
                              ]}
                            />
                          </View>
                          <Text style={styles.detailProgressText}>
                            {selectedTransaction.progress}%
                          </Text>
                        </View>
                      </View>
                    )}
                </View>
                </ScrollView>
              </>
            ) : null}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: '#1e88e5',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  placeholder: {
    width: 80,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9ca3af',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
  transactionCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  transactionImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
    marginRight: 12,
    overflow: 'hidden',
  },
  transactionImage: {
    width: '100%',
    height: '100%',
  },
  transactionInfo: {
    flex: 1,
    marginRight: 12,
  },
  transactionProductName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  transactionReference: {
    fontSize: 11,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  transactionPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffd700',
  },
  progressContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#2a2a2a',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1e88e5',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
  loadingMoreContainer: {
    padding: 20,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    width: '90%',
    maxHeight: '90%',
    minHeight: '50%',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    flexDirection: 'column',
    position: 'relative',
  },
  modalScrollView: {
    flex: 1,
    width: '100%',
  },
  modalScrollContent: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  modalLoadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalLoadingText: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 12,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    elevation: 10,
  },
  modalCloseText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  detailImageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginTop: 20,
  },
  detailImage: {
    width: '100%',
    height: '100%',
  },
  detailInfo: {
    padding: 20,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  detailStatusContainer: {
    marginBottom: 20,
  },
  detailStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  detailStatusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  detailPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  detailPriceLabel: {
    fontSize: 16,
    color: '#9ca3af',
  },
  detailPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffd700',
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  detailLabel: {
    fontSize: 14,
    color: '#9ca3af',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  detailDescription: {
    fontSize: 14,
    color: '#e5e7eb',
    lineHeight: 20,
    marginBottom: 12,
  },
  detailDisclaimer: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  detailProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailProgressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#2a2a2a',
    borderRadius: 4,
    overflow: 'hidden',
  },
  detailProgressFill: {
    height: '100%',
    backgroundColor: '#1e88e5',
    borderRadius: 4,
  },
  detailProgressText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '600',
    minWidth: 50,
    textAlign: 'right',
  },
});

export default TransactionsScreen;

