#include <node.h>
#include <node_buffer.h>

#include "LauncherShared.h"
#include <memory>
#include <string>

void LaunchGame(v8::FunctionCallbackInfo<v8::Value> const& args)
{
    v8::Isolate* isolate = args.GetIsolate();
    v8::HandleScope scope(isolate);

    if (args.Length() < 5)
    {
        isolate->ThrowException(v8::Exception::TypeError(v8::String::NewFromUtf8(isolate, "Wrong number of arguments, expected 5")));
        return;
    }

    if (!args[0]->IsString() || !args[1]->IsBoolean() || !args[2]->IsString() || !args[3]->IsString() || !args[4]->IsString())
    {
        isolate->ThrowException(v8::Exception::TypeError(v8::String::NewFromUtf8(isolate,
                "Wrong arguments types, expected (gameInstallDir: string, use64Bit: boolean, portal: string, loginTicket: string, gameAccount: string)")));
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

void EncryptJsString(v8::FunctionCallbackInfo<v8::Value> const& args)
{
    v8::Isolate* isolate = args.GetIsolate();
    v8::HandleScope scope(isolate);

    if (args.Length() != 1)
    {
        isolate->ThrowException(v8::Exception::TypeError(v8::String::NewFromUtf8(isolate, "Wrong number of arguments, expected 1")));
        return;
    }

    if (!args[0]->IsString())
    {
        isolate->ThrowException(v8::Exception::TypeError(v8::String::NewFromUtf8(isolate,
            "Wrong arguments types, expected (inputString: string)")));
        return;
    }

    v8::String::Utf8Value inputString(args[0]->ToString(isolate));
    std::unique_ptr<std::vector<uint8_t>> encryptedString = std::make_unique<std::vector<uint8_t>>();

    if (!EncryptString(*inputString, encryptedString.get()))
    {
        isolate->ThrowException(v8::Exception::Error(v8::String::NewFromUtf8(isolate, "Encryption failed")));
        return;
    }

    char* data = reinterpret_cast<char*>(encryptedString->data());
    size_t length = encryptedString->size();
    node::Buffer::FreeCallback deleter = [](char*, void* hint) { delete reinterpret_cast<std::vector<uint8_t>*>(hint); };
    v8::Local<v8::Object> returnBuffer;
    if (node::Buffer::New(isolate, data, length, deleter, encryptedString.release()).ToLocal(&returnBuffer))
        args.GetReturnValue().Set(returnBuffer);
    else
        isolate->ThrowException(v8::Exception::Error(v8::String::NewFromUtf8(isolate, "Output buffer creation failed")));
}

void DecryptJsString(v8::FunctionCallbackInfo<v8::Value> const& args)
{
    v8::Isolate* isolate = args.GetIsolate();
    v8::HandleScope scope(isolate);

    if (args.Length() != 1)
    {
        isolate->ThrowException(v8::Exception::TypeError(v8::String::NewFromUtf8(isolate, "Wrong number of arguments, expected 1")));
        return;
    }

    if (!args[0]->IsObject())
    {
        isolate->ThrowException(v8::Exception::TypeError(v8::String::NewFromUtf8(isolate,
            "Wrong arguments types, expected (encryptedString: Buffer)")));
        return;
    }

    v8::Local<v8::Object> encryptedString = args[0]->ToObject(isolate);
    uint8_t* data = reinterpret_cast<uint8_t*>(node::Buffer::Data(encryptedString));
    size_t length = node::Buffer::Length(encryptedString);
    std::string outputString;

    if (!DecryptString(std::vector<uint8_t>(data, data + length), &outputString))
    {
        isolate->ThrowException(v8::Exception::Error(v8::String::NewFromUtf8(isolate, "Decryption failed")));
        return;
    }

    v8::Local<v8::String> returnString;
    if (v8::String::NewFromUtf8(isolate, outputString.c_str(), v8::NewStringType::kNormal, outputString.length()).ToLocal(&returnString))
        args.GetReturnValue().Set(returnString);
    else
        isolate->ThrowException(v8::Exception::TypeError(v8::String::NewFromUtf8(isolate, "Output string creation failed")));
}

void Init(v8::Handle<v8::Object> exports)
{
    NODE_SET_METHOD(exports, "launchGame", LaunchGame);
    NODE_SET_METHOD(exports, "encryptString", EncryptJsString);
    NODE_SET_METHOD(exports, "decryptString", DecryptJsString);
}

NODE_MODULE(tc_launcher, Init)
