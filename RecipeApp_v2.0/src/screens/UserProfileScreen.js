import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  ActivityIndicator,
  ScrollView,
  Image
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import FirebaseService from '../services/FirebaseService';

const UserProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  
  // Form verileri
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    const currentUser = FirebaseService.getCurrentUser();
    
    if (!currentUser) {
      navigation.navigate('Login');
      return;
    }

    try {
      const userDoc = await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .get();

      if (userDoc.exists) {
        const data = userDoc.data();
        setUserData(data);
        
        // Form verilerini doldur
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        setUsername(data.username || '');
        setAge(data.age ? data.age.toString() : '');
        setGender(data.gender || '');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Hata', 'Kullanıcı bilgileri yüklenirken bir sorun oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    const currentUser = FirebaseService.getCurrentUser();
    
    if (!currentUser) {
      return;
    }

    if (!firstName || !lastName || !username) {
      Alert.alert('Hata', 'Ad, soyad ve kullanıcı adı zorunludur');
      return;
    }

    try {
      await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .update({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          username: username.trim(),
          age: age ? parseInt(age) : null,
          gender: gender.trim(),
        });
      
      // Profil bilgilerini güncelle
      setUserData({
        ...userData,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim(),
        age: age ? parseInt(age) : null,
        gender: gender.trim(),
      });
      
      setEditing(false);
      Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Hata', 'Profil güncellenirken bir sorun oluştu');
    }
  };

  const handleLogout = async () => {
    try {
      await FirebaseService.logoutUser();
      navigation.replace('Login');
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Hata', 'Çıkış yapılırken bir sorun oluştu');
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png' }}
            style={styles.avatar}
          />
        </View>
        
        <Text style={styles.profileName}>
          {userData?.firstName} {userData?.lastName}
        </Text>
        
        <Text style={styles.profileUsername}>@{userData?.username}</Text>
      </View>
      
      {editing ? (
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Profili Düzenle</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Ad"
            value={firstName}
            onChangeText={setFirstName}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Soyad"
            value={lastName}
            onChangeText={setLastName}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Kullanıcı Adı"
            value={username}
            onChangeText={setUsername}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Yaş"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Cinsiyet"
            value={gender}
            onChangeText={setGender}
          />
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]}
              onPress={() => setEditing(false)}
            >
              <Text style={styles.cancelButtonText}>İptal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]}
              onPress={handleSaveProfile}
            >
              <Text style={styles.buttonText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>Profil Bilgileri</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{userData?.email}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ad:</Text>
            <Text style={styles.infoValue}>{userData?.firstName}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Soyad:</Text>
            <Text style={styles.infoValue}>{userData?.lastName}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Kullanıcı Adı:</Text>
            <Text style={styles.infoValue}>{userData?.username}</Text>
          </View>
          
          {userData?.age && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Yaş:</Text>
              <Text style={styles.infoValue}>{userData.age}</Text>
            </View>
          )}
          
          {userData?.gender && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Cinsiyet:</Text>
              <Text style={styles.infoValue}>{userData.gender}</Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={[styles.button, styles.editButton]}
            onPress={() => setEditing(true)}
          >
            <Text style={styles.buttonText}>Profili Düzenle</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <TouchableOpacity 
        style={[styles.button, styles.logoutButton]}
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#f9f9f9',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e9f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  profileUsername: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  infoContainer: {
    padding: 16,
  },
  formContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#4CAF50',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    width: '30%',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  editButton: {
    backgroundColor: '#4CAF50',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    flex: 1,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#f1f1f1',
    flex: 1,
    marginRight: 8,
  },
  logoutButton: {
    backgroundColor: '#ff5252',
    marginHorizontal: 16,
    marginBottom: 32,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UserProfileScreen; 