import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

class FirebaseService {
  async registerUser(email, password, name, surname, username, age, gender) {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      await firestore().collection('users').doc(userCredential.user.uid).set({
        email: email,
        firstName: name,
        lastName: surname,
        username: username,
        age: age,
        gender: gender,
      });
      return "success";
    } catch (error) {
      return error.message;
    }
  }

  async addComment(recipeId, userId, rating, comment) {
    try {
      const docRef = firestore().collection('ratings').doc(recipeId);
      const snapshot = await docRef.get();

      if (snapshot.exists) {
        await docRef.update({
          users: firestore.FieldValue.arrayUnion(userId),
          rate: firestore.FieldValue.arrayUnion(rating),
          comments: firestore.FieldValue.arrayUnion(comment),
        });
      } else {
        await docRef.set({
          users: [userId],
          rate: [rating],
          comments: [comment],
        });
      }
    } catch (error) {
      throw error;
    }
  }

  async getComments(recipeId) {
    try {
      const docRef = firestore().collection('ratings').doc(recipeId);
      const snapshot = await docRef.get();

      if (snapshot.exists) {
        const data = snapshot.data();

        const userIds = data.users || [];
        const comments = data.comments || [];
        const ratings = data.rate || [];

        const result = [];

        for (let i = 0; i < userIds.length; i++) {
          const userId = userIds[i];
          const username = await this.getUsernameById(userId);

          result.push({
            username: username || 'Unknown User',
            comment: i < comments.length ? comments[i] : null,
            rating: i < ratings.length ? ratings[i] : null,
          });
        }

        return result;
      } else {
        return [];
      }
    } catch (error) {
      throw error;
    }
  }

  async getUsernameById(userId) {
    try {
      const userDoc = await firestore().collection('users').doc(userId).get();
      if (userDoc.exists) {
        return userDoc.data().username;
      } else {
        return null;
      }
    } catch (error) {
      throw error;
    }
  }

  async loginUser(email, password) {
    try {
      await auth().signInWithEmailAndPassword(email, password);
      return "success";
    } catch (error) {
      return error.message;
    }
  }

  async logoutUser() {
    try {
      await auth().signOut();
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  }

  getCurrentUser() {
    return auth().currentUser;
  }

  // FAVORİ FONKSİYONLARI (sadece tarif id'si ile)
  async addFavorite(userId, recipeId) {
    try {
      const userFavRef = firestore().collection('usersfavorites').doc(userId);
      const doc = await userFavRef.get();
      if (doc.exists) {
        await userFavRef.update({
          favorites: firestore.FieldValue.arrayUnion(recipeId)
        });
      } else {
        await userFavRef.set({
          favorites: [recipeId]
        });
      }
    } catch (error) {
      throw error;
    }
  }

  async removeFavorite(userId, recipeId) {
    try {
      const userFavRef = firestore().collection('usersfavorites').doc(userId);
      const doc = await userFavRef.get();
      if (doc.exists) {
        await userFavRef.update({
          favorites: firestore.FieldValue.arrayRemove(recipeId)
        });
      }
    } catch (error) {
      throw error;
    }
  }

  async isFavorite(userId, recipeId) {
    try {
      const userFavRef = firestore().collection('usersfavorites').doc(userId);
      const doc = await userFavRef.get();
      if (doc.exists) {
        const favs = doc.data().favorites || [];
        return favs.includes(recipeId);
      }
      return false;
    } catch (error) {
      throw error;
    }
  }
}

export default new FirebaseService(); 