import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Platform, PlatformColor, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native'
import type { RootStackParamList } from '../../App'

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>

function WelcomeScreen({ navigation }: Props) {
    const { width } = useWindowDimensions()
    const isPhone = width < 768

    return (
        <View style={styles.container}>
            <Text>
                <Text style={styles.logo}>Fizz</Text>
                <Text
                    style={[
                        styles.logo,
                        {
                            color: '#007AFF',
                        },
                    ]}
                >
                    Up
                </Text>
            </Text>

            <Text style={styles.demo}>B2B DEMO</Text>

            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    isPhone ? styles.buttonPhone : styles.buttonTablet,
                    { opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => {
                    navigation.navigate('Sessions')
                }}
            >
                <Text style={styles.buttonLabel}>Liste des séances</Text>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                backgroundColor: PlatformColor('systemBackground'),
            },
            android: {
                backgroundColor: PlatformColor('?attr/sampleBackgroundColor'),
            },
            default: {
                backgroundColor: '#FFFFFF',
            },
        }),
    },
    logo: {
        fontSize: 80,
        fontFamily: 'BebasNeue-Regular',
        ...Platform.select({
            ios: {
                color: PlatformColor('label'),
            },
            android: {
                color: PlatformColor('?attr/samplePrimaryTextColor'),
            },
            default: {
                color: '#111111',
            },
        }),
    },
    demo: {
        fontSize: 17,
        marginTop: -10,
        ...Platform.select({
            ios: {
                color: PlatformColor('tertiaryLabel'),
            },
            android: {
                color: PlatformColor('?attr/sampleSecondaryTextColor'),
            },
            default: {
                color: '#666666',
            },
        }),
    },
    button: {
        position: 'absolute',
        bottom: 50,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#007AFF',
    },
    buttonPhone: {
        left: 20,
        right: 20,
    },
    buttonTablet: {
        alignSelf: 'center',
        width: 320,
    },
    buttonLabel: {
        color: 'white',
        fontSize: 17,
        fontWeight: 'bold',
    },
})

export default WelcomeScreen
