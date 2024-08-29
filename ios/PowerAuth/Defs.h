//
//  Defs.h
//  PowerAuthTest
//
//  Created by Jan Kobersky on 28.08.2024.
//

#ifndef PW_DEFS
#define PW_DEFS

#ifdef RCT_REMAP_METHOD

#import <React/RCTBridgeModule.h>
#import <React/RCTInitializing.h>
#import <React/RCTConvert.h>

#define PAJS_MODULE(name) @interface name : NSObject<RCTBridgeModule, RCTInitializing>

#define PAJS_MODULE_REGISTRY @synthesize moduleRegistry = _moduleRegistry;

#define PAJS_OBJECT_REGISTER _objectRegister = [_moduleRegistry moduleForName:"PowerAuthObjectRegister"];

#define PAJS_ARGUMENT(idx, name, type) name:(type)name \

#define PAJS_METHOD_START(name, parameters) \
RCT_REMAP_METHOD(name,\
                 parameters \
                 resolve:(RCTPromiseResolveBlock)resolve \
                 reject:(RCTPromiseRejectBlock)reject) \
{

#define PAJS_METHOD_END }

#else

#import <Cordova/CDVPlugin.h>

// to be able to use React interfaces
typedef void (^RCTPromiseRejectBlock)(NSString *code, NSString *message, NSError *error);
typedef void (^RCTPromiseResolveBlock)(id result);
#define RCT_EXPORT_MODULE(name)
#define RCTConvert

// declaration of the modile
#define PAJS_MODULE(name) @interface name : CDVPlugin

#define PAJS_ARGUMENT(idx, name, type) type name = [cmd argumentAtIndex:idx];

#define PAJS_METHOD_START(name, parameters) \
- (void)name:(CDVInvokedUrlCommand*)cmd \
{ \
    parameters \
    RCTPromiseRejectBlock reject = ^(NSString *code, NSString *message, NSError *error) { \
        [[self commandDelegate] sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:message] callbackId: cmd.callbackId]; \
    }; \
    RCTPromiseResolveBlock resolve = ^(id result) { \
        NSError *writeError = nil; \
NSData *jsonData = [NSJSONSerialization dataWithJSONObject:@{ @"result": result } options:NSJSONWritingPrettyPrinted error:&writeError]; \
        NSString *jsonString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];   \
        [[self commandDelegate] sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:jsonString] callbackId: cmd.callbackId]; \
    };

#define PAJS_METHOD_END }

#define PAJS_MODULE_REGISTRY

#define PAJS_OBJECT_REGISTER CDVAppDelegate *cdvAd = [self appDelegate]; \
CDVViewController *cdvVc = [cdvAd viewController]; \
_objectRegister = [[cdvVc pluginObjects] objectForKey:@"PowerAuthObjectRegister"];

#endif

#endif
