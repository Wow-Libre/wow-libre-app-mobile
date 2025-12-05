import React, {useState} from 'react';
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
} from 'react-native';
import {Images} from '../constant';

const {width} = Dimensions.get('window');
const ITEM_WIDTH = (width - 60) / 2;

interface ShopItem {
  id: string;
  name: string;
  price: number;
  category: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  image: string;
  description: string;
}

const shopItems: ShopItem[] = [
  {
    id: '1',
    name: 'Espada del Rey Lich',
    price: 5000,
    category: 'weapons',
    rarity: 'legendary',
    image: Images.WOW_ICON,
    description: 'Espada legendaria con poder helado',
  },
  {
    id: '2',
    name: 'Armadura de Placas Épica',
    price: 3500,
    category: 'armor',
    rarity: 'epic',
    image: Images.WOW_ICON,
    description: 'Protección superior para guerreros',
  },
  {
    id: '3',
    name: 'Montura Alada Dorada',
    price: 8000,
    category: 'mounts',
    rarity: 'legendary',
    image: Images.WOW_ICON,
    description: 'Vuela por los cielos de Azeroth',
  },
  {
    id: '4',
    name: 'Mascota Dragón Pequeño',
    price: 2000,
    category: 'pets',
    rarity: 'rare',
    image: Images.WOW_ICON,
    description: 'Compañero leal para tus aventuras',
  },
  {
    id: '5',
    name: 'Arco Élfico Épico',
    price: 4200,
    category: 'weapons',
    rarity: 'epic',
    image: Images.WOW_ICON,
    description: 'Precisión y poder en cada flecha',
  },
  {
    id: '6',
    name: 'Capa de las Sombras',
    price: 2800,
    category: 'armor',
    rarity: 'rare',
    image: Images.WOW_ICON,
    description: 'Ocúltate en las tinieblas',
  },
  {
    id: '7',
    name: 'Montura Lobo de Guerra',
    price: 1500,
    category: 'mounts',
    rarity: 'uncommon',
    image: Images.WOW_ICON,
    description: 'Velocidad y ferocidad',
  },
  {
    id: '8',
    name: 'Poción de Fuerza',
    price: 500,
    category: 'consumables',
    rarity: 'common',
    image: Images.WOW_ICON,
    description: 'Aumenta tu poder temporalmente',
  },
  {
    id: '9',
    name: 'Anillo del Poder',
    price: 6000,
    category: 'accessories',
    rarity: 'legendary',
    image: Images.WOW_ICON,
    description: 'Amuleto con poderes místicos',
  },
  {
    id: '10',
    name: 'Escudo del Protector',
    price: 3200,
    category: 'weapons',
    rarity: 'epic',
    image: Images.WOW_ICON,
    description: 'Defiende a tus aliados',
  },
];

const categories = [
  {id: 'all', name: 'Todos', icon: '⚔️'},
  {id: 'weapons', name: 'Armas', icon: '🗡️'},
  {id: 'armor', name: 'Armaduras', icon: '🛡️'},
  {id: 'mounts', name: 'Monturas', icon: '🐴'},
  {id: 'pets', name: 'Mascotas', icon: '🐾'},
  {id: 'consumables', name: 'Consumibles', icon: '🧪'},
  {id: 'accessories', name: 'Accesorios', icon: '💍'},
];

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'common':
      return '#9d9d9d';
    case 'uncommon':
      return '#1eff00';
    case 'rare':
      return '#0070dd';
    case 'epic':
      return '#a335ee';
    case 'legendary':
      return '#ff8000';
    default:
      return '#9d9d9d';
  }
};

const getRarityName = (rarity: string) => {
  switch (rarity) {
    case 'common':
      return 'Común';
    case 'uncommon':
      return 'Poco Común';
    case 'rare':
      return 'Raro';
    case 'epic':
      return 'Épico';
    case 'legendary':
      return 'Legendario';
    default:
      return 'Común';
  }
};

const ShopScreen = ({navigation}: {navigation: any}): React.JSX.Element => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<string[]>([]);

  const filteredItems =
    selectedCategory === 'all'
      ? shopItems
      : shopItems.filter(item => item.category === selectedCategory);

  const toggleCart = (itemId: string) => {
    setCart(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId],
    );
  };

  const renderItem = ({item}: {item: ShopItem}) => {
    const isInCart = cart.includes(item.id);
    const rarityColor = getRarityColor(item.rarity);

    return (
      <TouchableOpacity
        style={styles.itemCard}
        activeOpacity={0.8}
        onPress={() => toggleCart(item.id)}>
        <View style={[styles.itemImageContainer, {borderColor: rarityColor}]}>
          <Image
            source={{uri: item.image}}
            style={styles.itemImage}
            resizeMode="contain"
          />
          <View style={[styles.rarityBadge, {backgroundColor: rarityColor}]}>
            <Text style={styles.rarityText}>
              {getRarityName(item.rarity)}
            </Text>
          </View>
          {isInCart && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>✓</Text>
            </View>
          )}
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.itemDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.itemFooter}>
            <Text style={styles.itemPrice}>
              {item.price.toLocaleString()} 🪙
            </Text>
            <TouchableOpacity
              style={[
                styles.buyButton,
                isInCart && styles.buyButtonActive,
                {borderColor: rarityColor},
              ]}
              onPress={() => toggleCart(item.id)}>
              <Text
                style={[
                  styles.buyButtonText,
                  isInCart && styles.buyButtonTextActive,
                ]}>
                {isInCart ? 'En Carrito' : 'Comprar'}
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
            {cart.length} items en el carrito
          </Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.fruitWheelHeaderButton}
            onPress={() => navigation.navigate('FruitWheel')}
            activeOpacity={0.7}>
            <Text style={styles.fruitWheelHeaderIcon}>🎰</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cartButton}>
            <Text style={styles.cartIcon}>🛒</Text>
            {cart.length > 0 && (
              <View style={styles.cartCount}>
                <Text style={styles.cartCountText}>{cart.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}>
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(category.id)}
            activeOpacity={0.7}>
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.id &&
                  styles.categoryTextActive,
              ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Items Grid */}
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.itemsContainer}
        columnWrapperStyle={styles.itemsRow}
        showsVerticalScrollIndicator={false}
      />
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
  fruitWheelHeaderButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ec4899',
  },
  fruitWheelHeaderIcon: {
    fontSize: 24,
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
  cartButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffd700',
    position: 'relative',
  },
  cartIcon: {
    fontSize: 24,
  },
  cartCount: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#0a0a0a',
  },
  cartCountText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
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
    height: 140,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 2,
    position: 'relative',
  },
  itemImage: {
    width: 80,
    height: 80,
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
  cartBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0a0a0a',
  },
  cartBadgeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
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
  buyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  buyButtonActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  buyButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  buyButtonTextActive: {
    color: '#ffffff',
  },
});

export default ShopScreen;

