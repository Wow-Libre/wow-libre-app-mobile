import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Alert,
  Modal,
  Linking,
} from 'react-native';
import {WebView} from 'react-native-webview';
import {Images} from '../constant';
import {
  getProducts,
  getProduct,
  getPaymentMethodsGateway,
  getAccounts,
  buyProduct,
  CategoryDetail,
  Product,
  ProductDetail,
  PaymentMethodsGatewayReponse,
} from '../api/internal/index';
import {Account} from '../api/models/AccountModel';
import {getJWT} from '../services/storage';

const {width} = Dimensions.get('window');
const ITEM_WIDTH = (width - 60) / 2;

const ShopScreen = ({navigation}: {navigation: any}): React.JSX.Element => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<CategoryDetail[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(
    null,
  );
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [isCheckoutModalVisible, setIsCheckoutModalVisible] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<
    PaymentMethodsGatewayReponse[]
  >([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethodsGatewayReponse | null>(null);
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] =
    useState(false);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showPaymentMethodDropdown, setShowPaymentMethodDropdown] =
    useState(false);
  const [payuFormData, setPayuFormData] = useState<any>(null);
  const [isPayuModalVisible, setIsPayuModalVisible] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const productsData = await getProducts('es');
      
      // Convertir el objeto de categorías a array
      const categoriesArray: CategoryDetail[] = [];
      const productsArray: Product[] = [];
      
      Object.keys(productsData).forEach(categoryKey => {
        const categoryDetails = productsData[categoryKey];
        categoryDetails.forEach(category => {
          categoriesArray.push(category);
          productsArray.push(...category.products);
        });
      });
      
      setCategories(categoriesArray);
      setAllProducts(productsArray);
    } catch (error: any) {
      console.error('Error al cargar productos:', error);
      Alert.alert(
        'Error',
        error?.message || 'No se pudieron cargar los productos. Por favor intenta de nuevo.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryProducts = (categoryId: string): Product[] => {
    if (categoryId === 'all') {
      return allProducts;
    }
    
    const category = categories.find(cat => cat.id.toString() === categoryId);
    return category ? category.products : [];
  };

  const filteredItems = getCategoryProducts(selectedCategory);

  const handleProductPress = async (item: Product) => {
    try {
      console.log('Producto seleccionado:', item);
      console.log('Reference number:', item.reference_number);
      
      if (!item.reference_number) {
        Alert.alert('Error', 'El producto no tiene número de referencia.');
        return;
      }

      setIsLoadingProduct(true);
      setIsProductModalVisible(true);
      
      const productDetail = await getProduct(item.reference_number);
      console.log('Detalle del producto cargado:', productDetail);
      
      setSelectedProduct(productDetail);
    } catch (error: any) {
      console.error('Error al cargar detalle del producto:', error);
      setIsProductModalVisible(false);
      Alert.alert(
        'Error',
        error?.message || 'No se pudo cargar el detalle del producto.',
      );
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const handleBuy = async (product: ProductDetail) => {
   

    try {
      setIsLoadingPaymentMethods(true);
      setIsLoadingAccounts(true);
      const jwt = await getJWT();
      if (!jwt) {
        Alert.alert('Error', 'No se encontró la sesión. Por favor inicia sesión nuevamente.');
        navigation.navigate('Login');
        return;
      }

      // Cargar métodos de pago y cuentas en paralelo
      const [paymentMethodsData, accountsData] = await Promise.all([
        getPaymentMethodsGateway(jwt),
        getAccounts(jwt, 0, 10, null, null),
      ]);

      setPaymentMethods(paymentMethodsData);
      setAccounts(accountsData.accounts);
      setIsProductModalVisible(false);
      setIsCheckoutModalVisible(true);
    } catch (error: any) {
      console.error('Error al cargar datos de checkout:', error);
      Alert.alert(
        'Error',
        error?.message || 'No se pudieron cargar los datos. Por favor intenta de nuevo.',
      );
    } finally {
      setIsLoadingPaymentMethods(false);
      setIsLoadingAccounts(false);
    }
  };

  const handleContinueCheckout = async () => {
    if (!selectedAccount) {
      Alert.alert('Error', 'Por favor selecciona una cuenta');
      return;
    }
    if (!selectedPaymentMethod) {
      Alert.alert('Error', 'Por favor selecciona un método de pago');
      return;
    }
    if (!selectedProduct) {
      Alert.alert('Error', 'No hay producto seleccionado');
      return;
    }

    try {
      const jwt = await getJWT();
      if (!jwt) {
        Alert.alert('Error', 'No se encontró la sesión. Por favor inicia sesión nuevamente.');
        navigation.navigate('Login');
        return;
      }

      const paymentTypeName =
        selectedPaymentMethod.payment_type || selectedPaymentMethod.name || '';

      const response = await buyProduct(
        selectedAccount.account_id,
        jwt,
        false,
        selectedProduct.reference_number,
        paymentTypeName,
        selectedAccount.server_id,
      );

      // Si el producto usa puntos, navegar directamente a transacciones
      if (selectedProduct.use_points) {
        setIsCheckoutModalVisible(false);
        setSelectedProduct(null);
        setSelectedAccount(null);
        setSelectedPaymentMethod(null);
        navigation.navigate('Transactions');
        return;
      }

      // Si no es un pago, navegar directamente
      if (!response.is_payment) {
        const canOpen = await Linking.canOpenURL(response.redirect);
        if (canOpen) {
          await Linking.openURL(response.redirect);
        } else {
          Alert.alert('Error', 'No se pudo abrir la URL de redirección');
        }
        setIsCheckoutModalVisible(false);
        setSelectedProduct(null);
        setSelectedAccount(null);
        setSelectedPaymentMethod(null);
        return;
      }

      // Verificar si el método de pago es PayU
      if (paymentTypeName.toLowerCase() === 'payu') {
        // Para PayU, necesitamos crear un formulario POST
        const paymentData: Record<string, string> = {
          merchantId: response.payu.merchant_id,
          accountId: response.payu.account_id,
          description: response.description,
          referenceCode: response.reference_code,
          amount: response.amount,
          tax: response.tax,
          taxReturnBase: response.tax_return_base,
          currency: response.currency,
          signature: response.payu.signature,
          test: response.payu.test,
          buyerEmail: response.buyer_email,
          responseUrl: response.response_url,
          confirmationUrl: response.confirmation_url,
        };

        setPayuFormData({
          url: response.redirect,
          data: paymentData,
        });
        setIsCheckoutModalVisible(false);
        setIsPayuModalVisible(true);
      } else {
        // Para otros métodos de pago, abrir la URL directamente
        const canOpen = await Linking.canOpenURL(response.redirect);
        if (canOpen) {
          await Linking.openURL(response.redirect);
        } else {
          Alert.alert('Error', 'No se pudo abrir la URL de pago');
        }
      }

      setIsCheckoutModalVisible(false);
      setSelectedProduct(null);
      setSelectedAccount(null);
      setSelectedPaymentMethod(null);
    } catch (error: any) {
      console.error('Error al procesar la compra:', error);
      Alert.alert(
        'Error',
        error?.message || 'No se pudo procesar la compra. Por favor intenta de nuevo.',
      );
    }
  };

  const formatPrice = (product: Product | ProductDetail) => {
    if (product.discount > 0) {
      // Para ProductDetail no hay discount_price, calcularlo
      if ('discount_price' in product) {
        return product.discount_price;
      }
      return product.price * (1 - product.discount / 100);
    }
    return product.price;
  };

  const formatPriceUSD = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const renderItem = ({item}: {item: Product}) => {
    const price = formatPrice(item);

    return (
      <TouchableOpacity
        style={styles.itemCard}
        activeOpacity={0.8}
        onPress={() => handleProductPress(item)}>
        <View style={styles.itemImageContainer}>
          <Image
            source={{
              uri: item.img_url || Images.WOW_ICON,
            }}
            style={styles.itemImage}
            resizeMode="contain"
            defaultSource={{
              uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/WoW_icon.svg/1200px-WoW_icon.svg.png',
            }}
          />
          {item.discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{item.discount}%</Text>
            </View>
          )}
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.itemDescription} numberOfLines={2}>
            {item.description || item.disclaimer}
          </Text>
          <View style={styles.itemFooter}>
            <View style={styles.priceContainer}>
              {item.discount > 0 && (
                <Text style={styles.originalPrice}>
                  {formatPriceUSD(item.price)}
                </Text>
              )}
              <Text style={styles.itemPrice}>
                {item.use_points ? `${price.toLocaleString()} pts` : formatPriceUSD(price)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => handleProductPress(item)}
              activeOpacity={0.8}>
              <Text style={styles.viewButtonText}>
                Ver Detalle
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Tienda de Azeroth</Text>
            <Text style={styles.headerSubtitle}>
              Explora nuestros productos
            </Text>
          </View>
          <View style={styles.headerButtons} />
        </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}>
        <TouchableOpacity
          style={[
            styles.categoryButton,
            selectedCategory === 'all' && styles.categoryButtonActive,
          ]}
          onPress={() => setSelectedCategory('all')}
          activeOpacity={0.7}>
          <Text style={styles.categoryIcon}>⚔️</Text>
          <Text
            style={[
              styles.categoryText,
              selectedCategory === 'all' && styles.categoryTextActive,
            ]}>
            Todos
          </Text>
        </TouchableOpacity>
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id.toString() &&
                styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(category.id.toString())}
            activeOpacity={0.7}>
            <Text style={styles.categoryIcon}>📦</Text>
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.id.toString() &&
                  styles.categoryTextActive,
              ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Items Grid */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffd700" />
          <Text style={styles.loadingText}>Cargando productos...</Text>
        </View>
      ) : filteredItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay productos disponibles</Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.itemsContainer}
          columnWrapperStyle={styles.itemsRow}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Product Detail Modal */}
      <Modal
        visible={isProductModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsProductModalVisible(false)}>
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {isLoadingProduct ? (
              <View style={styles.modalLoadingContainer}>
                <ActivityIndicator size="large" color="#ffd700" />
                <Text style={styles.modalLoadingText}>Cargando detalle...</Text>
              </View>
            ) : selectedProduct ? (
              <>
                {/* Close Button */}
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => {
                    setIsProductModalVisible(false);
                    setSelectedProduct(null);
                  }}
                  activeOpacity={0.7}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
                <ScrollView
                  style={styles.modalScrollView}
                  contentContainerStyle={styles.modalScrollContent}
                  showsVerticalScrollIndicator={false}>

                {/* Product Image */}
                <View style={styles.productDetailImageContainer}>
                  <Image
                    source={{
                      uri: selectedProduct.img_url || Images.WOW_ICON,
                    }}
                    style={styles.productDetailImage}
                    resizeMode="cover"
                    defaultSource={{
                      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/WoW_icon.svg/1200px-WoW_icon.svg.png',
                    }}
                  />
                  {selectedProduct.discount > 0 && (
                    <View style={styles.productDiscountBadge}>
                      <Text style={styles.productDiscountText}>
                        -{selectedProduct.discount}%
                      </Text>
                    </View>
                  )}
                </View>

                {/* Product Info */}
                <View style={styles.productDetailInfo}>
                  <Text style={styles.productDetailName}>
                    {selectedProduct.name}
                  </Text>
                  {selectedProduct.description && (
                    <Text style={styles.productDetailDescription}>
                      {selectedProduct.description}
                    </Text>
                  )}
                  {selectedProduct.disclaimer && (
                    <Text style={styles.productDetailDisclaimer}>
                      {selectedProduct.disclaimer}
                    </Text>
                  )}

                  {/* Price */}
                  <View style={styles.productDetailPriceContainer}>
                    {selectedProduct.discount > 0 && (
                      <Text style={styles.productDetailOriginalPrice}>
                        {formatPriceUSD(selectedProduct.price)}
                      </Text>
                    )}
                    <Text style={styles.productDetailPrice}>
                      {selectedProduct.use_points
                        ? `${formatPrice(selectedProduct).toLocaleString()} pts`
                        : formatPriceUSD(formatPrice(selectedProduct))}
                    </Text>
                  </View>

                  {/* Product Details */}
                  {selectedProduct.details &&
                    selectedProduct.details.length > 0 && (
                      <View style={styles.productDetailsSection}>
                        <Text style={styles.productDetailsTitle}>
                          Detalles del Producto
                        </Text>
                        {selectedProduct.details.map((detail: any, index: number) => (
                          <View key={detail.id} style={styles.productDetailItem}>
                            {detail.img_url && (
                              <Image
                                source={{uri: detail.img_url}}
                                style={styles.productDetailItemImage}
                                resizeMode="cover"
                              />
                            )}
                            <View style={styles.productDetailItemContent}>
                              <Text style={styles.productDetailItemTitle}>
                                {detail.title}
                              </Text>
                              <Text style={styles.productDetailItemDescription}>
                                {detail.description}
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                </View>
                </ScrollView>
              </>
            ) : null}

            {/* Buy Button */}
            {selectedProduct && !isLoadingProduct && (
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.buyButtonLarge}
                  onPress={() => handleBuy(selectedProduct)}
                  activeOpacity={0.8}>
                  <Text style={styles.buyButtonLargeText}>
                    Comprar Ahora
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>

      {/* Checkout Modal */}
      <Modal
        visible={isCheckoutModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setIsCheckoutModalVisible(false);
          setSelectedAccount(null);
          setSelectedPaymentMethod(null);
        }}>
        <SafeAreaView style={styles.checkoutModalOverlay}>
          <View style={styles.checkoutModalContent}>
            {/* Header */}
            <View style={styles.checkoutHeader}>
              <View style={styles.checkoutHeaderLeft}>
                <View style={styles.checkoutIconContainer}>
                  <Text style={styles.checkoutIcon}>$</Text>
                </View>
                <Text style={styles.checkoutTitle}>Completar Compra</Text>
              </View>
              <TouchableOpacity
                style={styles.checkoutCloseButton}
                onPress={() => {
                  setIsCheckoutModalVisible(false);
                  setSelectedAccount(null);
                  setSelectedPaymentMethod(null);
                }}
                activeOpacity={0.7}>
                <Text style={styles.checkoutCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Info Message */}
            <View style={styles.checkoutInfoBox}>
              <View style={styles.checkoutInfoIcon}>
                <Text style={styles.checkoutInfoCheck}>✓</Text>
              </View>
              <Text style={styles.checkoutInfoText}>
                Al adquirir este producto, no solo obtendrás un premio increíble,
                sino que también contribuirás a la mejora de nuestro servidor. Tu
                generosidad hace posible que sigamos creciendo.
              </Text>
            </View>

            {/* Account Selection */}
            <View style={styles.checkoutSection}>
              <Text style={styles.checkoutSectionLabel}>
                & Seleccionar Cuenta
              </Text>
              <TouchableOpacity
                style={styles.checkoutDropdown}
                onPress={() => {
                  setShowAccountDropdown(!showAccountDropdown);
                  setShowPaymentMethodDropdown(false);
                }}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.checkoutDropdownText,
                    !selectedAccount && styles.checkoutDropdownPlaceholder,
                  ]}>
                  {selectedAccount
                    ? `${selectedAccount.username} - ${selectedAccount.realm}`
                    : 'Seleccione una cuenta'}
                </Text>
                <Text style={styles.checkoutDropdownArrow}>▼</Text>
              </TouchableOpacity>
              {showAccountDropdown && (
                <View style={styles.checkoutDropdownList}>
                  <ScrollView style={styles.checkoutDropdownScroll}>
                    {accounts.map(account => (
                      <TouchableOpacity
                        key={account.account_id}
                        style={styles.checkoutDropdownItem}
                        onPress={() => {
                          setSelectedAccount(account);
                          setShowAccountDropdown(false);
                        }}
                        activeOpacity={0.7}>
                        <Text style={styles.checkoutDropdownItemText}>
                          {account.username} - {account.realm}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Payment Method Selection */}
            <View style={styles.checkoutSection}>
              <Text style={styles.checkoutSectionLabel}>Método de Pago</Text>
              <TouchableOpacity
                style={styles.checkoutDropdown}
                onPress={() => {
                  setShowPaymentMethodDropdown(!showPaymentMethodDropdown);
                  setShowAccountDropdown(false);
                }}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.checkoutDropdownText,
                    !selectedPaymentMethod &&
                      styles.checkoutDropdownPlaceholder,
                  ]}>
                  {selectedPaymentMethod
                    ? selectedPaymentMethod.name
                    : 'Seleccione un método de pago'}
                </Text>
                <Text style={styles.checkoutDropdownArrow}>▼</Text>
              </TouchableOpacity>
              {showPaymentMethodDropdown && (
                <View style={styles.checkoutDropdownList}>
                  <ScrollView style={styles.checkoutDropdownScroll}>
                    {paymentMethods.map(method => (
                      <TouchableOpacity
                        key={method.id}
                        style={styles.checkoutDropdownItem}
                        onPress={() => {
                          setSelectedPaymentMethod(method);
                          setShowPaymentMethodDropdown(false);
                        }}
                        activeOpacity={0.7}>
                        {method.img_url && (
                          <Image
                            source={{uri: method.img_url}}
                            style={styles.paymentMethodImage}
                            resizeMode="contain"
                          />
                        )}
                        <Text style={styles.checkoutDropdownItemText}>
                          {method.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Buttons */}
            <View style={styles.checkoutButtons}>
              <TouchableOpacity
                style={styles.checkoutCancelButton}
                onPress={() => {
                  setIsCheckoutModalVisible(false);
                  setSelectedAccount(null);
                  setSelectedPaymentMethod(null);
                }}
                activeOpacity={0.7}>
                <Text style={styles.checkoutCancelIcon}>✕</Text>
                <Text style={styles.checkoutCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.checkoutContinueButton}
                onPress={handleContinueCheckout}
                activeOpacity={0.7}>
                <Text style={styles.checkoutContinueText}>Continuar</Text>
                <Text style={styles.checkoutContinueArrow}>›</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* PayU WebView Modal */}
      <Modal
        visible={isPayuModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => {
          setIsPayuModalVisible(false);
          setPayuFormData(null);
        }}>
        <SafeAreaView style={styles.payuModalContainer}>
          <View style={styles.payuModalHeader}>
            <TouchableOpacity
              style={styles.payuCloseButton}
              onPress={() => {
                setIsPayuModalVisible(false);
                setPayuFormData(null);
              }}
              activeOpacity={0.7}>
              <Text style={styles.payuCloseText}>✕ Cerrar</Text>
            </TouchableOpacity>
          </View>
          {payuFormData && (
            <WebView
              source={{
                html: `
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <title>Procesando pago...</title>
                    </head>
                    <body style="margin: 0; padding: 0; background: #f5f5f5; display: flex; justify-content: center; align-items: center; min-height: 100vh;">
                      <div style="text-align: center; padding: 20px;">
                        <p style="font-size: 16px; color: #333;">Procesando pago con PayU...</p>
                        <p style="font-size: 14px; color: #666; margin-top: 10px;">Por favor espera...</p>
                      </div>
                      <form id="payuForm" method="POST" action="${payuFormData.url}" style="display: none;">
                        ${Object.keys(payuFormData.data)
                          .map(
                            key =>
                              `<input type="hidden" name="${key}" value="${String(
                                payuFormData.data[key],
                              ).replace(/"/g, '&quot;')}" />`,
                          )
                          .join('')}
                      </form>
                      <script>
                        window.onload = function() {
                          document.getElementById('payuForm').submit();
                        };
                      </script>
                    </body>
                  </html>
                `,
              }}
              onNavigationStateChange={navState => {
                // Si PayU redirige a response_url, cerrar el modal
                if (
                  navState.url.includes('response_url') ||
                  navState.url.includes('responseUrl') ||
                  navState.url.includes('confirmation') ||
                  navState.url.includes('success') ||
                  navState.url.includes('error')
                ) {
                  setIsPayuModalVisible(false);
                  setPayuFormData(null);
                  // Opcional: navegar a transacciones o mostrar mensaje
                  Alert.alert(
                    'Pago procesado',
                    'Tu pago está siendo procesado. Revisa tus transacciones para ver el estado.',
                  );
                }
              }}
              onError={syntheticEvent => {
                const {nativeEvent} = syntheticEvent;
                console.error('WebView error: ', nativeEvent);
                Alert.alert('Error', 'Hubo un problema al cargar el pago. Por favor intenta de nuevo.');
              }}
              style={styles.payuWebView}
            />
          )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffd700',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '400',
  },
  categoriesContainer: {
    maxHeight: 70,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  categoriesContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#2a2a2a',
  },
  categoryButtonActive: {
    backgroundColor: '#ffd700',
    borderColor: '#ffd700',
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  categoryText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#0a0a0a',
    fontWeight: '700',
  },
  itemsContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  itemsRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  itemCard: {
    width: ITEM_WIDTH,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  itemImageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 2,
    position: 'relative',
  },
  itemImage: {
    width: 140,
    height: 140,
  },
  rarityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rarityText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  itemInfo: {
    padding: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    minHeight: 40,
  },
  itemDescription: {
    fontSize: 11,
    color: '#9ca3af',
    marginBottom: 12,
    lineHeight: 16,
    minHeight: 32,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffd700',
    flex: 1,
  },
  viewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
    borderColor: '#1e88e5',
  },
  viewButtonText: {
    color: '#1e88e5',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  priceContainer: {
    flex: 1,
  },
  originalPrice: {
    fontSize: 12,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#0a0a0a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '100%',
    flexDirection: 'column',
    flex: 1,
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    paddingBottom: 40,
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
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  modalCloseText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  productDetailImageContainer: {
    width: '100%',
    height: 400,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginTop: 20,
    marginBottom: 10,
    overflow: 'hidden',
  },
  productDetailImage: {
    width: '100%',
    height: '100%',
  },
  productDiscountBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  productDiscountText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  productDetailInfo: {
    padding: 24,
    paddingTop: 10,
  },
  productDetailName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
    lineHeight: 36,
  },
  productDetailDescription: {
    fontSize: 16,
    color: '#e5e7eb',
    lineHeight: 26,
    marginBottom: 16,
  },
  productDetailDisclaimer: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
    marginBottom: 24,
    lineHeight: 20,
  },
  productDetailPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 16,
    paddingVertical: 8,
  },
  productDetailOriginalPrice: {
    fontSize: 20,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  productDetailPrice: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffd700',
  },
  productDetailsSection: {
    marginTop: 16,
  },
  productDetailsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 20,
  },
  productDetailItem: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  productDetailItemImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 16,
    backgroundColor: '#2a2a2a',
  },
  productDetailItemContent: {
    flex: 1,
    justifyContent: 'center',
  },
  productDetailItemTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
  },
  productDetailItemDescription: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 22,
  },
  modalFooter: {
    padding: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
    backgroundColor: '#0a0a0a',
  },
  buyButtonLarge: {
    backgroundColor: '#10b981',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buyButtonLargeText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  checkoutModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
  },
  checkoutModalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    width: '90%',
    maxHeight: '85%',
    padding: 24,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  checkoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkoutHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkoutIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkoutIcon: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  checkoutTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
  },
  checkoutCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutCloseText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  checkoutInfoBox: {
    backgroundColor: '#1e3a8a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkoutInfoIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkoutInfoCheck: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  checkoutInfoText: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 20,
  },
  checkoutSection: {
    marginBottom: 20,
    position: 'relative',
  },
  checkoutSectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  checkoutDropdown: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  checkoutDropdownText: {
    color: '#ffffff',
    fontSize: 16,
    flex: 1,
  },
  checkoutDropdownPlaceholder: {
    color: '#9ca3af',
  },
  checkoutDropdownArrow: {
    color: '#9ca3af',
    fontSize: 12,
    marginLeft: 8,
  },
  checkoutDropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    zIndex: 1000,
    elevation: 5,
  },
  checkoutDropdownScroll: {
    maxHeight: 200,
  },
  checkoutDropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkoutDropdownItemText: {
    color: '#ffffff',
    fontSize: 16,
    flex: 1,
  },
  paymentMethodImage: {
    width: 30,
    height: 30,
    marginRight: 12,
    borderRadius: 4,
  },
  checkoutButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  checkoutCancelButton: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  checkoutCancelIcon: {
    color: '#ffffff',
    fontSize: 18,
    marginRight: 8,
  },
  checkoutCancelText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  checkoutContinueButton: {
    flex: 1,
    backgroundColor: '#3a3a3a',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutContinueText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  checkoutContinueArrow: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  payuModalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  payuModalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    backgroundColor: '#ffffff',
  },
  payuCloseButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  payuCloseText: {
    color: '#1e88e5',
    fontSize: 16,
    fontWeight: '600',
  },
  payuWebView: {
    flex: 1,
  },
});

export default ShopScreen;

