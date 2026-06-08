# trainingkit-reactnative

React Native bridge for FizzUp TrainingKit.

This package lets a React Native application launch FizzUp TrainingKit workouts without copying native bridges into the app. The GraphQL client stays in the host application. The package exposes the native device identifier and a single workout launcher that dispatches to the classic or video native SDK automatically.

## What It Provides

- `deviceIdentifier()` returns the native TrainingKit device identifier.
- `launchWorkout(session)` launches a workout from a GraphQL session payload.
- iOS bridge is included in the package; `TrainingKit.xcframework` is fetched from `getfizzup/trainingkit-ios-sdk@main` during CocoaPods installation.
- Android bridge and TrainingKit activities are included in the package.
- React Native autolinking handles the native package integration.

`launchWorkout` supports sessions where either `__typename` or `format` identifies the workout kind:

- `WorkoutBlockSession` or `format: 'CLASSIC'` launches the classic TrainingKit flow.
- `WorkoutVideoSession` or `format: 'PLAY'` launches the video TrainingKit flow.

## Demo App

This repository contains a local demo app in `sample`.

The demo consumes the package using a local file dependency:

```json
"trainingkit-reactnative": "file:.."
```

Run it locally with:

```sh
cd sample
yarn install
cd ios
pod install
cd ..
yarn ios
```

For a published package, use the npm dependency instead:

```sh
yarn add trainingkit-reactnative
```

## Installation In An Existing React Native App

Install the package:

```sh
yarn add trainingkit-reactnative
```

Or, while developing against this repository locally:

```sh
yarn add file:../relative/path/to/trainingkit-reactnative
```

Then install iOS pods:

```sh
cd ios
pod install
cd ..
```

React Native apps must be rebuilt after installing a native dependency:

```sh
yarn ios
yarn android
```

## iOS Setup

The iOS TrainingKit binary is not versioned in this repository. It is fetched from the stable `main` branch of `https://github.com/getfizzup/trainingkit-ios-sdk` during `pod install` through the package podspec.

CocoaPods installs the downloaded XCFramework at:

```text
ios/Vendor/TrainingKit.xcframework
```

The host app does not need to add the TrainingKit Swift Package manually. CocoaPods integrates the package through `TrainingKitReactNative.podspec` and its `prepare_command`.

For local package development, you can fetch the framework manually before running pods:

```sh
yarn fetch:ios-trainingkit
```

If your app was already using the native bridge from the old demo, remove the manually copied files from the app target to avoid duplicate native modules:

- `TrainingKitModule.swift`
- `TrainingKitModule.m`
- custom `ClassicWorkoutController` / `StreamingWorkoutController` subclasses copied only for the bridge

## Android Setup

The Android SDK is resolved from GitHub Packages. Add the FizzUp Maven repository to the app's Android Gradle configuration if it is not already present.

In `android/build.gradle`:

```gradle
buildscript {
    repositories {
        google()
        mavenCentral()
        maven {
            url "https://maven.pkg.github.com/getfizzup/trainingkit-android-sdk"
            credentials {
                username = properties.getProperty("GithubUser") ?: System.getenv("GITHUB_USERNAME")
                password = properties.getProperty("GithubToken") ?: System.getenv("GITHUB_TOKEN")
            }
        }
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
        maven {
            url "https://maven.pkg.github.com/getfizzup/trainingkit-android-sdk"
            credentials {
                username = properties.getProperty("GithubUser") ?: System.getenv("GITHUB_USERNAME")
                password = properties.getProperty("GithubToken") ?: System.getenv("GITHUB_TOKEN")
            }
        }
    }
}
```

Credentials can be provided in `android/local.properties`:

```properties
GithubUser=your-github-username
GithubToken=your-github-token
```

Or through environment variables:

```sh
export GITHUB_USERNAME=your-github-username
export GITHUB_TOKEN=your-github-token
```

Chromecast support is optional.

If you want casting in the video workout flow, provide your Google Cast receiver application ID.

You can set it in `android/local.properties`:

```properties
chromecastReceiverApplicationId=YOUR_CAST_APP_ID
```

Or with an environment variable:

```sh
export CHROMECAST_RECEIVER_APPLICATION_ID=YOUR_CAST_APP_ID
```

If your app was already using the old manual Android bridge, remove the manually copied bridge code from the app:

- `TrainingKitModule.kt`
- `TrainingKitReact.kt`
- `ClassicWorkoutActivity.kt`
- `VideoWorkoutActivity.kt`
- `CastOptionsProvider.kt`
- manual `add(TrainingKitReact())` in `MainApplication.kt`
- direct app dependency `implementation("com.fysiki:trainingkit:v32.1")`, because the package declares it
- manually declared TrainingKit activities from `AndroidManifest.xml`, because the package manifest declares them

## GraphQL Contract

The app is responsible for querying the backend. The package does not create or own the Apollo client.

The backend flow is:

1. The app sends `X-TrainingKit-Device` with the GraphQL request.
2. The backend returns the workout session payload and `trainingKitToken`.
3. The app passes the session object to `launchWorkout(session)`.
4. The package forwards the payload and token to the native SDK.

The session passed to `launchWorkout` must contain:

```ts
type TrainingKitSession = {
  __typename?: string
  format?: string
  trainingKitToken: string
  [key: string]: unknown
}
```

## Apollo Client Setup

Install Apollo if your app does not already use it:

```sh
yarn add @apollo/client graphql
```

Create the client in your app and include the device header:

```ts
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { ApolloProvider } from '@apollo/client/react'
import { deviceIdentifier } from 'trainingkit-reactnative'

const client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://cloud.demo.fizzup.com/graphql',
    headers: {
      'X-TrainingKit-Device': deviceIdentifier(),
    },
  }),
  cache: new InMemoryCache(),
})

export function App() {
  return (
    <ApolloProvider client={client}>
      {/* Your navigation/app */}
    </ApolloProvider>
  )
}
```

`deviceIdentifier()` is synchronous because the native SDK exposes a stable device id synchronously on both platforms.

## Listing Workouts

The exact GraphQL documents depend on your generated schema. The demo uses generated operations named `GetSessionsDocument` and `GetSessionContentDocument`.

The list query should return workout preview items with at least:

- `id`
- `name`
- `duration`
- `picture`
- `format`

Example screen shape:

```tsx
import { useQuery } from '@apollo/client/react'
import { Pressable, SectionList, Text, View } from 'react-native'
import { GetSessionsDocument, WorkoutFormat } from '../graphql/types'

export function SessionsScreen() {
  const { data, loading, error } = useQuery(GetSessionsDocument)

  if (loading) {
    return <Text>Loading...</Text>
  }

  if (error) {
    return <Text>{error.message}</Text>
  }

  const sections = [
    {
      title: 'Classic workouts',
      data: data?.publicWorkouts.edges
        .filter(edge => edge.node.format === WorkoutFormat.Classic)
        .map(edge => edge.node) ?? [],
    },
    {
      title: 'Video workouts',
      data: data?.publicWorkouts.edges
        .filter(edge => edge.node.format === WorkoutFormat.Play)
        .map(edge => edge.node) ?? [],
    },
  ]

  return (
    <SectionList
      sections={sections}
      keyExtractor={item => item.id}
      renderSectionHeader={({ section }) => <Text>{section.title}</Text>}
      renderItem={({ item }) => (
        <Pressable onPress={() => launchWorkoutById(item.id)}>
          <View>
            <Text>{item.name}</Text>
          </View>
        </Pressable>
      )}
    />
  )
}
```

## Launching A Workout

To launch a workout, fetch the full session payload first. The full session response must include `trainingKitToken`.

```tsx
import { useLazyQuery } from '@apollo/client/react'
import { Alert } from 'react-native'
import { launchWorkout } from 'trainingkit-reactnative'
import { GetSessionContentDocument } from '../graphql/types'

export function useWorkoutLauncher() {
  const [fetchSessionContent] = useLazyQuery(GetSessionContentDocument)

  return async function launchWorkoutById(id: string) {
    try {
      const { data } = await fetchSessionContent({ variables: { id } })
      const session = data?.publicWorkoutSession

      if (!session) {
        throw new Error('Workout session not found')
      }

      launchWorkout(session)
    } catch (error) {
      Alert.alert('Workout error', error instanceof Error ? error.message : String(error))
    }
  }
}
```

`launchWorkout` handles the native dispatch internally:

- classic session -> `launchClassicWorkout(JSON.stringify(session), session.trainingKitToken)`
- video session -> `launchVideoWorkout(JSON.stringify(session), session.trainingKitToken)`

## Handling Workout Completion

Subscribe to the workout lifecycle with `addWorkoutListener` to react when a
workout is saved or quit — for example to persist results to your backend.

```ts
import { addWorkoutListener } from 'trainingkit-reactnative'

const subscription = addWorkoutListener({
  onSave: (workout) => {
    // The workout finished with a result. `workout` mirrors the native SDK's
    // SaveWorkoutState (richer on iOS than on Android). Persist it here.
  },
  onQuit: () => {
    // The user quit the workout without completing it.
  },
  onEvent: (name, properties) => {
    // Optional: a TrainingKit analytics event.
  },
})

// Stop listening when you no longer need it (e.g. on unmount):
subscription.remove()
```

Add the listener **before** calling `launchWorkout` so no event is missed. The
callbacks mirror the FizzUp Web SDK's `onWorkoutSave` / `onWorkoutQuit` /
`onWorkoutEvent`.

## Building A Demo App From Scratch

Create a new React Native app:

```sh
npx @react-native-community/cli init TrainingKitReactNativeDemo
cd TrainingKitReactNativeDemo
```

Install app dependencies:

```sh
yarn add trainingkit-reactnative @apollo/client graphql
```

During local package development, replace the published dependency with a relative file reference:

```sh
yarn add file:../relative/path/to/trainingkit-reactnative
```

Configure Android access to the FizzUp Maven repository as described in the Android section.

Install iOS pods:

```sh
cd ios
pod install
cd ..
```

Create your GraphQL operations and generate types if your project uses GraphQL Codegen. The demo repository uses generated documents from `graphql/types.ts`, but the package itself does not require GraphQL Codegen.

Wire Apollo at the root of the app with `deviceIdentifier()` in the headers.

Build and run:

```sh
yarn ios
yarn android
```

## Troubleshooting

### Native Module Not Found

If you see:

```text
TrainingKitModule is not available
```

Reinstall native dependencies and rebuild the app:

```sh
yarn install
cd ios
pod install
cd ..
yarn ios
```

Do not rely on Metro reload after adding a native package. A native rebuild is required.

### iOS CocoaPods And Ruby

React Native iOS builds are sensitive to the Ruby and CocoaPods versions used by the project.

If `pod install` hangs, or if `bundle exec pod --version` hangs, check which Ruby is being used:

```sh
ruby --version
which ruby
bundle --version
which bundle
pod --version
which pod
```

Use `rbenv` to run a Ruby 3.x version instead of Ruby 4 if CocoaPods or Bundler behaves incorrectly:

```sh
brew install rbenv ruby-build
rbenv install 3.3.6
rbenv local 3.3.6
eval "$(rbenv init -)"
gem install bundler
bundle install
```

Then run pods through Bundler:

```sh
cd ios
bundle exec pod install
```

If your shell does not pick up the rbenv Ruby, add this to your shell config, then restart the terminal:

```sh
eval "$(rbenv init -)"
```

### iOS Component Missing In Xcode

If `xcodebuild` fails with an error like:

```text
iOS 26.4 is not installed. Please download and install the platform from Xcode > Settings > Components.
```

Open Xcode and install the matching iOS platform component:

```text
Xcode > Settings > Components
```

After installing, rerun:

```sh
yarn ios
```

### React Native fmt consteval Build Error

With recent Xcode/iOS SDK combinations, React Native's `fmt` pod can fail with:

```text
call to consteval function ... is not a constant expression
```

The sample app includes a `post_install` workaround in `sample/ios/Podfile` that patches `Pods/fmt/include/fmt/base.h` after CocoaPods installs dependencies:

```ruby
fmt_base_header = File.join(installer.sandbox.root, 'fmt/include/fmt/base.h')
if File.exist?(fmt_base_header)
  File.chmod(0644, fmt_base_header)
  contents = File.read(fmt_base_header)
  contents = contents.gsub('#elif defined(__cpp_consteval)', '#elif 0 && defined(__cpp_consteval)')
  contents = contents.gsub('#elif FMT_GCC_VERSION >= 1002 || FMT_CLANG_VERSION >= 1101', '#elif 0 && (FMT_GCC_VERSION >= 1002 || FMT_CLANG_VERSION >= 1101)')
  File.write(fmt_base_header, contents)
end
```

Run `pod install` again after adding the workaround.

### iOS TrainingKit.xcframework Missing

If CocoaPods fails because the vendored framework is missing:

```text
ios/Vendor/TrainingKit.xcframework
```

Fetch it manually from `getfizzup/trainingkit-ios-sdk@main`, then run pods again:

```sh
yarn fetch:ios-trainingkit
cd ios
pod install
```

The script uses `TRAININGKIT_IOS_SDK_URL` if you need to test a different archive URL temporarily:

```sh
TRAININGKIT_IOS_SDK_URL=https://github.com/getfizzup/trainingkit-ios-sdk/archive/refs/heads/main.zip yarn fetch:ios-trainingkit
```

### Android Cannot Resolve com.fysiki:trainingkit

If Android fails to resolve:

```text
com.fysiki:trainingkit:v31
```

Check that the GitHub Packages Maven repository is configured and that credentials are available through `local.properties` or environment variables.

### Duplicate Native Module Or Duplicate Activity

If you previously copied the demo bridge into your app, remove the manual bridge files after installing this package. Keeping both can create duplicate modules or duplicate Android manifest entries.

### Local file: Dependency Does Not Update

When using a local dependency:

```json
"trainingkit-reactnative": "file:../relative/path/to/workoutkit-reactnative"
```

Re-run install after changing the package contents:

```sh
yarn install
cd ios
pod install
cd ..
```

Then rebuild the native app.

## Package Development Checklist

Before publishing, verify the package contents:

```sh
npm pack --dry-run
```

The tarball should include:

- `src`
- `ios`
- `android`
- `scripts/fetch-ios-trainingkit.sh`
- `TrainingKitReactNative.podspec`
- `react-native.config.js`

The tarball should not include `ios/Vendor/TrainingKit.xcframework`; it is downloaded from `getfizzup/trainingkit-ios-sdk@main` during CocoaPods installation.

The demo can be used as an integration test for the package before publishing to npm.
