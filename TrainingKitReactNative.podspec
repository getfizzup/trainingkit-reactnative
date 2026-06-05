require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = 'TrainingKitReactNative'
  s.version      = package['version']
  s.summary      = package['description']
  s.homepage     = 'https://github.com/getfizzup/trainingkit-reactnative'
  s.license      = package['license']
  s.authors      = { 'Fysiki' => 'support@fizzup.com' }
  s.platforms    = { :ios => '15.1' }
  s.source       = { :git => 'https://github.com/getfizzup/trainingkit-reactnative.git', :tag => s.version.to_s }
  s.source_files = 'ios/**/*.{h,m,mm,swift}'
  s.prepare_command = './scripts/fetch-ios-trainingkit.sh'
  s.vendored_frameworks = 'ios/Vendor/TrainingKit.xcframework'
  s.swift_versions = ['5.9']

  s.dependency 'React-Core'
end
