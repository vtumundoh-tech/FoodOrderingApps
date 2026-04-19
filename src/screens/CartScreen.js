import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, TextInput, Modal } from 'react-native';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { Minus, Plus, Trash2, CheckCircle } from 'lucide-react-native';

export default function CartScreen({ navigation }) {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(false);

  const [guestName, setGuestName] = useState(user?.user_metadata?.full_name || '');
  const [guestTable, setGuestTable] = useState('');

  const [profile, setProfile] = useState(null);
  const [pointsToUse, setPointsToUse] = useState('0');

  const [paymentMethod, setPaymentMethod] = useState(''); // 'transfer', 'qris', 'cod'
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);

  const cartTotal = getTotalPrice();

  useEffect(() => {
    if (user && !user.is_anonymous) {
      fetchProfile();
    }
  }, [user]);

  async function fetchProfile() {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) setProfile(data);
  }

  // Kalkulasi Harga Akhir
  let rawPointsInput = parseInt(pointsToUse || '0', 10);
  if (isNaN(rawPointsInput) || rawPointsInput < 0) rawPointsInput = 0;

  let pointsDiscount = rawPointsInput;
  if (profile && pointsDiscount > profile.points) pointsDiscount = profile.points;

  let finalPrice = cartTotal - pointsDiscount;
  if (finalPrice < 0) finalPrice = 0;

  const handleValidation = () => {
    if (cart.length === 0) return Alert.alert('Error', 'Keranjang masih kosong!');
    if (!guestName || !guestTable) return Alert.alert('Error', 'Nama Pemesan dan Nomor Meja wajib diisi!');
    if (profile && rawPointsInput > profile.points) return Alert.alert('Poin Tidak Mencukupi', 'Anda mencoba memasukkan jumlah poin yang melebihi saldo yang tersedia!');
    if (!paymentMethod) return Alert.alert('Error', 'Pilih metode pembayaran terlebih dahulu!');

    setShowPaymentModal(true);
  };

  const processPayment = () => {
    setCheckingPayment(true);
    // Simulasi loading checking payment 2 detik
    setTimeout(() => {
      setCheckingPayment(false);
      setShowPaymentModal(false);
      executeOrder();
    }, 2000);
  };

  async function executeOrder() {
    setLoading(true);

    // 1. Buat record di tabel orders
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id: user.id,
        total_price: finalPrice,
        status: 'pending',
        guest_name: guestName,
        guest_table: guestTable,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'cod' ? 'unpaid' : 'paid'
      }])
      .select()
      .single();

    if (orderError) {
      setLoading(false);
      return Alert.alert('Pesanan Gagal', orderError.message);
    }

    // 2. Buat record di tabel order_items
    const orderItems = cart.map((item) => ({
      order_id: orderData.id,
      food_id: item.id,
      quantity: item.quantity,
      price_at_time: item.price,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

    if (itemsError) {
      setLoading(false);
      return Alert.alert('Gagal Menyimpan Item', itemsError.message);
    }

    // 3. Potong Poin Member jika dipakai
    if (pointsDiscount > 0 && profile) {
      await supabase.from('profiles').update({ points: profile.points - pointsDiscount }).eq('id', user.id);
    }

    clearCart();
    setLoading(false);

    const isCod = paymentMethod === 'cod';
    Alert.alert(
      isCod ? 'Menunggu Verifikasi Kasir' : 'Pembayaran Sukses!',
      isCod ? 'Silakan bayar di kasir/kepada pelayan agar pesanan Anda dapat diproses.' : 'Silakan tunggu pesanan Anda diantarkan ke meja.',
      [{ text: 'OK', onPress: () => navigation.navigate('OrderHistory') }]
    );
  }

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>Rp {item.price.toLocaleString('id-ID')}</Text>
      </View>
      <View style={styles.quantityContainer}>
        <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.id, item.quantity - 1)}>
          <Minus size={16} color="#2f3542" />
        </TouchableOpacity>
        <Text style={styles.qtyText}>{item.quantity}</Text>
        <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.id, item.quantity + 1)}>
          <Plus size={16} color="#2f3542" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => removeFromCart(item.id)}>
        <Trash2 size={20} color="#ff4757" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={cart}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.emptyText}>Keranjang Anda masih kosong</Text>}
        ListFooterComponent={cart.length > 0 ? (
          <View style={styles.footerSection}>
            <Text style={styles.sectionTitle}>👨‍🍳 Data Pemesan (Wajib)</Text>
            <TextInput style={styles.input} placeholder="Nama Pemesan" value={guestName} onChangeText={setGuestName} />
            <TextInput style={styles.input} placeholder="Nomor Meja" value={guestTable} onChangeText={setGuestTable} keyboardType="numeric" />

            {!user?.is_anonymous && profile && (
              <View style={styles.memberBox}>
                <Text style={styles.sectionTitle}>🎁 Dompet Poin Member</Text>
                <View style={styles.pointRow}>
                  <Text style={{ color: '#57606f', fontSize: 13 }}>Saldo Tersedia: Rp {profile.points.toLocaleString('id-ID')}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                    <Text style={{ fontSize: 13, marginRight: 8, fontWeight: 'bold' }}>Dipakai: </Text>
                    <TextInput style={styles.pointInput} keyboardType="numeric" value={pointsToUse} onChangeText={setPointsToUse} />
                  </View>
                </View>
              </View>
            )}

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>💳 Metode Pembayaran</Text>
            <View style={styles.paymentRow}>
              <TouchableOpacity style={[styles.payOption, paymentMethod === 'qris' && styles.payOptionActive]} onPress={() => setPaymentMethod('qris')}>
                <Text style={[styles.payText, paymentMethod === 'qris' && styles.payTextActive]}>QRIS</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.payOption, paymentMethod === 'transfer' && styles.payOptionActive]} onPress={() => setPaymentMethod('transfer')}>
                <Text style={[styles.payText, paymentMethod === 'transfer' && styles.payTextActive]}>Transfer Bank</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.payOption, paymentMethod === 'cod' && styles.payOptionActive]} onPress={() => setPaymentMethod('cod')}>
                <Text style={[styles.payText, paymentMethod === 'cod' && styles.payTextActive]}>Bayar di Tempat</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryText}>Subtotal</Text>
                <Text style={styles.summaryText}>Rp {cartTotal.toLocaleString('id-ID')}</Text>
              </View>
              {pointsDiscount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryDiscount}>Poin Dipakai</Text>
                  <Text style={styles.summaryDiscount}>- Rp {pointsDiscount.toLocaleString('id-ID')}</Text>
                </View>
              )}
              <View style={[styles.summaryRow, { marginTop: 8, borderTopWidth: 1, borderColor: '#dfe4ea', paddingTop: 8 }]}>
                <Text style={styles.summaryTotalLabel}>Total Bayar</Text>
                <Text style={styles.summaryTotalValue}>Rp {finalPrice.toLocaleString('id-ID')}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.checkoutBtn, loading && styles.disabledBtn]}
              onPress={handleValidation}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.checkoutText}>Lanjutkan Pembayaran</Text>}
            </TouchableOpacity>
          </View>
        ) : null}
      />

      {/* Payment Simulation Modal */}
      <Modal visible={showPaymentModal} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            {checkingPayment ? (
              <>
                <ActivityIndicator size="large" color="#1e90ff" />
                <Text style={styles.modalTitle}>Memvalidasi Pembayaran...</Text>
                <Text style={styles.modalDesc}>Mohon tunggu, sedang mengecek sistem {paymentMethod.toUpperCase()}.</Text>
              </>
            ) : (
              <>
                <CheckCircle size={60} color="#2ed573" />
                <Text style={styles.modalTitle}>{paymentMethod === 'cod' ? 'Validasi Bayar di Tempat' : 'Lakukan Pembayaran'}</Text>
                <Text style={styles.modalDesc}>Jumlah: Rp {finalPrice.toLocaleString('id-ID')}</Text>
                <TouchableOpacity style={styles.simulateBtn} onPress={processPayment}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>{paymentMethod === 'cod' ? 'Lanjutkan Pesanan' : 'Cek Pembayaran'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelPayBtn} onPress={() => setShowPaymentModal(false)}>
                  <Text style={{ color: '#ff4757', fontWeight: 'bold' }}>Batal</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f2f6' },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#747d8c' },
  cartItem: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16, flexDirection: 'row', alignItems: 'center' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: 'bold', color: '#2f3542', marginBottom: 4 },
  itemPrice: { fontSize: 14, color: '#ff4757', fontWeight: 'bold' },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f2f6', borderRadius: 8, padding: 4, marginRight: 12 },
  qtyBtn: { padding: 4 },
  qtyText: { fontSize: 16, fontWeight: 'bold', width: 30, textAlign: 'center' },
  deleteBtn: { padding: 8 },
  footerSection: { marginTop: 10 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#2f3542', marginBottom: 10 },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 14 },
  memberBox: { backgroundColor: '#fff0f2', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#ffccd5', marginTop: 16 },
  applyBtn: { backgroundColor: '#ff4757', paddingHorizontal: 16, borderRadius: 8, justifyContent: 'center' },
  pointRow: { borderTopWidth: 1, borderColor: '#ffccd5', paddingTop: 8 },
  pointInput: { backgroundColor: '#fff', borderRadius: 4, padding: 4, width: 80, fontSize: 14, borderWidth: 1, borderColor: '#dfe4ea', textAlign: 'center' },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  payOption: { flex: 1, backgroundColor: '#fff', paddingVertical: 12, borderRadius: 8, marginRight: 8, alignItems: 'center', borderWidth: 1, borderColor: '#dfe4ea' },
  payOptionActive: { backgroundColor: '#1e90ff', borderColor: '#1e90ff' },
  payText: { fontSize: 12, fontWeight: 'bold', color: '#57606f', textAlign: 'center' },
  payTextActive: { color: '#fff' },
  summaryBox: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 20 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  summaryText: { fontSize: 14, color: '#57606f' },
  summaryDiscount: { fontSize: 14, color: '#2ed573' },
  summaryTotalLabel: { fontSize: 16, fontWeight: 'bold', color: '#2f3542' },
  summaryTotalValue: { fontSize: 18, fontWeight: 'bold', color: '#ff4757' },
  checkoutBtn: { backgroundColor: '#ff4757', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 40 },
  disabledBtn: { backgroundColor: '#ff6b81' },
  checkoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: '#fff', width: '80%', padding: 24, borderRadius: 16, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#2f3542', marginTop: 16, marginBottom: 8 },
  modalDesc: { textAlign: 'center', color: '#747d8c', marginBottom: 20 },
  simulateBtn: { backgroundColor: '#1e90ff', padding: 12, borderRadius: 8, width: '100%', alignItems: 'center', marginBottom: 8 },
  cancelPayBtn: { padding: 12 }
});
