#include <node.h>

#include "LauncherShared.h"

void LaunchGame(v8::FunctionCallbackInfo<v8::Value> const &args)
{
    v8::Isolate* isolate = args.GetIsolate();
    v8::HandleScope scope(isolate);

    if (args.Length() < 5)
    {
        isolate->ThrowException(v8::Exception::TypeError(v8::String::NewFromUtf8(isolate, "Wrong number of arguments")));
        return;
    }

    if (!args[0]->IsString() || !args[1]->IsBoolean() || !args[2]->IsString() || !args[3]->IsString() || !args[4]->IsString())
    {
        isolate->ThrowException(v8::Exception::TypeError(v8::String::NewFromUtf8(isolate, "Wrong arguments typess")));
        return;
    }

    v8::String::Utf8Value gameInstallDir(args[0]->ToString(isolate));
    bool use64Bit = args[1]->BooleanValue();
    v8::String::Utf8Value portal(args[2]->ToString(isolate));
    v8::String::Utf8Value loginTicket(args[3]->ToString(isolate));
    v8::String::Utf8Value gameAccount(args[4]->ToString(isolate));

    bool success = false;
    if (StoreLoginTicket(*portal, *loginTicket, *gameAccount))
        if (LaunchGameWithLogin(*gameInstallDir, use64Bit))
            success = true;

    args.GetReturnValue().Set(v8::Boolean::New(isolate, success));
}

void Init(v8::Handle<v8::Object> exports)
{
    NODE_SET_METHOD(exports, "launchGame", LaunchGame);
}

NODE_MODULE(tc_launcher, Init)
