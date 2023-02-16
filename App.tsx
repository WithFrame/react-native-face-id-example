import React, {useState} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ReactNativeBiometrics, {BiometryTypes} from 'react-native-biometrics';
import AsyncStorage from '@react-native-async-storage/async-storage';

// mock server functions
const verifyUserCredentials = payload => {
  // make an HTTP request to the server and verify user credentials
  return {userId: '123456'};
};

const sendPublicKeyToServer = publicKey => {
  // make an HTTP request to the server and save the `publicKey` on the user's entity
  console.log({publicKey});
};

const verifySignatureWithServer = async ({signature, payload}) => {
  // make an HTTP request to the server and verify the signature with the public key.

  return {status: 'success'};
};

const INPUT_OFFSET = 110;

export default function Example() {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#e8ecf4'}}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <FeatherIcon color="#075eec" name="lock" size={44} />
          </View>

          <Text style={styles.title}>
            Welcome to <Text style={{color: '#0742fc'}}>RealApps</Text>
          </Text>

          <Text style={styles.subtitle}>Collaborate with your friends</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.input}>
            <Text style={styles.inputLabel}>Email address</Text>

            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              onChangeText={email => setForm({...form, email})}
              placeholder=""
              placeholderTextColor="#6b7280"
              style={styles.inputControl}
              value={form.email}
            />
          </View>

          <View style={styles.input}>
            <Text style={styles.inputLabel}>Password</Text>

            <TextInput
              autoCorrect={false}
              onChangeText={password => setForm({...form, password})}
              placeholder=""
              placeholderTextColor="#6b7280"
              style={styles.inputControl}
              secureTextEntry={true}
              value={form.password}
            />
          </View>

          <View style={styles.formAction}>
            <TouchableOpacity
              onPress={async () => {
                const {userId} = await verifyUserCredentials(form);

                // handle onPress
                const rnBiometrics = new ReactNativeBiometrics();

                const {available, biometryType} =
                  await rnBiometrics.isSensorAvailable();

                if (available && biometryType === BiometryTypes.FaceID) {
                  Alert.alert(
                    'Face ID',
                    'Would you like to enable Face ID authentication for the next time?',
                    [
                      {
                        text: 'Yes please',
                        onPress: async () => {
                          const {publicKey} = await rnBiometrics.createKeys();

                          await sendPublicKeyToServer(publicKey);

                          // save `userId` in the local storage to use it during Face ID authentication
                          await AsyncStorage.setItem('userId', userId);
                        },
                      },
                      {text: 'Cancel', style: 'cancel'},
                    ],
                  );
                }
              }}>
              <View style={styles.btn}>
                <Text style={styles.btnText}>Sign in</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.formActionSpacer} />

            <TouchableOpacity
              onPress={async () => {
                const rnBiometrics = new ReactNativeBiometrics();
                const {available, biometryType} =
                  await rnBiometrics.isSensorAvailable();

                if (!available || biometryType !== BiometryTypes.FaceID) {
                  Alert.alert(
                    'Oops!',
                    'Face ID is not available on this device.',
                  );
                  return;
                }

                const userId = await AsyncStorage.getItem('userId');

                if (!userId) {
                  Alert.alert(
                    'Oops!',
                    'You have to sign in using your credentials first to enable Face ID.',
                  );
                  return;
                }

                const timestamp = Math.round(
                  new Date().getTime() / 1000,
                ).toString();
                const payload = `${userId}__${timestamp}`;

                const {success, signature} = await rnBiometrics.createSignature(
                  {
                    promptMessage: 'Sign in',
                    payload,
                  },
                );

                if (!success) {
                  Alert.alert(
                    'Oops!',
                    'Something went wrong during authentication with Face ID. Please try again.',
                  );
                  return;
                }

                const {status, message} = await verifySignatureWithServer({
                  signature,
                  payload,
                });

                if (status !== 'success') {
                  Alert.alert('Oops!', message);
                  return;
                }

                Alert.alert('Success!', 'You are successfully authenticated!');
              }}>
              <View style={styles.btnSecondary}>
                <MaterialCommunityIcons
                  color="#000"
                  name="face-recognition"
                  size={22}
                  style={{marginRight: 12}}
                />

                <Text style={styles.btnSecondaryText}>Face ID</Text>

                <View style={{width: 34}} />
              </View>
            </TouchableOpacity>
          </View>

          <Text style={styles.formFooter}>
            By clicking "Sign in" above, you agree to RealApps's
            <Text style={{fontWeight: '600'}}> Terms & Conditions </Text>
            and
            <Text style={{fontWeight: '600'}}> Privacy Policy</Text>.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  header: {
    marginVertical: 36,
  },
  headerIcon: {
    alignSelf: 'center',
    width: 80,
    height: 80,
    marginBottom: 36,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 27,
    fontWeight: '700',
    color: '#1d1d1d',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#929292',
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  formAction: {
    marginVertical: 24,
  },
  formActionSpacer: {
    marginVertical: 8,
  },
  formFooter: {
    marginTop: 'auto',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: '#929292',
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  inputControl: {
    height: 44,
    backgroundColor: '#fff',
    paddingLeft: INPUT_OFFSET,
    paddingRight: 24,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: '500',
    color: '#222',
  },
  inputLabel: {
    position: 'absolute',
    width: INPUT_OFFSET,
    lineHeight: 44,
    top: 0,
    left: 0,
    bottom: 0,
    marginHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: '500',
    color: '#c0c0c0',
    zIndex: 9,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    backgroundColor: '#000',
    borderColor: '#000',
  },
  btnText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
    color: '#fff',
  },
  btnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    backgroundColor: 'transparent',
    borderColor: '#000',
  },
  btnSecondaryText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
    color: '#000',
  },
});
