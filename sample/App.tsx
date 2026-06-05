/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import {StatusBar, useColorScheme} from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import SessionsScreen from './src/screens/Sessions'
import WelcomeScreen from './src/screens/Welcome'
import {ApolloClient, HttpLink, InMemoryCache} from "@apollo/client";
import {ApolloProvider} from "@apollo/client/react";
import {deviceIdentifier} from 'trainingkit-reactnative'

export type RootStackParamList = {
    Welcome: undefined
    Sessions: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

function App() {
    const isDarkMode = useColorScheme() === 'dark'

    // Initialize Apollo Client
    const client = new ApolloClient({
        link: new HttpLink({
            uri: "https://cloud.demo.fizzup.com/graphql",
            headers: {
                "X-TrainingKit-Device": deviceIdentifier(),
            },
        }),
        cache: new InMemoryCache(),
    });

    return (
        <ApolloProvider client={client}>
            <SafeAreaProvider>
                <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
                <NavigationContainer>
                    <Stack.Navigator
                        initialRouteName="Welcome"
                        screenOptions={{  headerBackButtonDisplayMode: "minimal" }}
                    >
                        <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="Sessions" component={SessionsScreen} options={{ title: 'Mes séances' }} />
                    </Stack.Navigator>
                </NavigationContainer>
            </SafeAreaProvider>
        </ApolloProvider>
    )
}

export default App
