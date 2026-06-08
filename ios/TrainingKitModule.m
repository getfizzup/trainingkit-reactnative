#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(TrainingKitModule, RCTEventEmitter)
RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(deviceIdentifier)
RCT_EXTERN_METHOD(launchClassicWorkout:(NSString *)jsonString withToken:(NSString *)token)
RCT_EXTERN_METHOD(launchVideoWorkout:(NSString *)jsonString withToken:(NSString *)token)
@end
