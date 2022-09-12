#include <node.h>
#include <node_buffer.h>

#include "LauncherShared.h"
#include <memory>
#include <string>

void LaunchGame(v8::FunctionCallbackInfo<v8::Value> const& args)
{
    v8::Isolate* isolate = args.GetIsolate();
    v8::HandleScope scope(isolate);

    if (args.Length() < 4)
    {
        isolate->ThrowException(v8::Exception::TypeError(v8::String::NewFromUtf8(isolate, "Wrong number of arguments, expected 5", v8::NewStringType::kNormal)
            .ToLocalChecked()));
        return;
    }

    if (!args[0]->IsString() || !args[1]->IsString() || !args[2]->IsString() || !args[3]->IsString())
    {
        isolate->ThrowException(v8::Exception::TypeError(v8::String::NewFromUtf8(isolate,
                "Wrong arguments types, expected (gameInstallDir: string, portal: string, loginTicket: string, gameAccount: string)", v8::NewStringType::kNormal)
            .ToLocalChecked()));
        return;
    }

    v8::String::Utf8Value gameInstallDir(isolate,  args[0]->ToString(isolate->GetCurrentContext()).ToLocalChecked());
    v8::String::Utf8Value portal(isolate, args[1]->ToString(isolate->GetCurrentContext()).ToLocalChecked());
    v8::String::Utf8Value loginTicket(isolate, args[2]->ToString(isolate->GetCurrentContext()).ToLocalChecked());
    v8::String::Utf8Value gameAccount(isolate, args[3]->ToString(isolate->GetCurrentContext()).ToLocalChecked());

    bool success = false;
    if (StoreLoginTicket(*portal, *loginTicket, *gameAccount))
        if (LaunchGameWithLogin(*gameInstallDir))
            success = true;

    args.GetReturnValue().Set(v8::Boolean::New(isolate, success));
}

void EncryptJsString(v8::FunctionCallbackInfo<v8::Value> const& args)
{
    v8::Isolate* isolate = args.GetIsolate();
    v8::HandleScope scope(isolate);

    if (args.Length() != 1)
    {
        isolate->ThrowException(v8::Exception::TypeError(v8::String::NewFromUtf8(isolate, "Wrong number of arguments, expected 1", v8::NewStringType::kNormal).ToLocalChecked()));
        return;
    }

    if (!args[0]->IsString())
    {
        isolate->ThrowException(v8::Exception::TypeError(v8::String::NewFromUtf8(isolate,
            "Wrong arguments types, expected (inputString: string)", v8::NewStringType::kNormal).ToLocalChecked()));
        return;
    }

    v8::String::Utf8Value inputString(isolate, args[0]->ToString(isolate->GetCurrentContext()).ToLocalChecked());
    std::unique_ptr<std::vector<uint8_t>> encryptedString = std::make_unique<std::vector<uint8_t>>();

    if (!EncryptString(*inputString, encryptedString.get()))
    {
        isolate->ThrowException(v8::Exception::Error(v8::String::NewFromUtf8(isolate, "Encryption failed", v8::NewStringType::kNormal).ToLocalChecked()));
        return;
    }

    char* data = reinterpret_cast<char*>(encryptedString->data());
    size_t length = encryptedString->size();
    node::Buffer::FreeCallback deleter = [](char*, void* hint) { delete reinterpret_cast<std::vector<uint8_t>*>(hint); };
    v8::Local<v8::Object> returnBuffer;
    if (node::Buffer::New(isolate, data, length, deleter, encryptedString.release()).ToLocal(&returnBuffer))
        args.GetReturnValue().Set(returnBuffer);
    else
        isolate->ThrowException(v8::Exception::Error(v8::String::NewFromUtf8(isolate, "Output buffer creation failed", v8::NewStringType::kNormal).ToLocalChecked()));
}

void DecryptJsString(v8::FunctionCallbackInfo<v8::Value> const& args)
{
    v8::Isolate* isolate = args.GetIsolate();
    v8::HandleScope scope(isolate);

    if (args.Length() != 1)
    {
        isolate->ThrowException(v8::Exception::TypeError(v8::String::NewFromUtf8(isolate, "Wrong number of arguments, expected 1", v8::NewStringType::kNormal)
            .ToLocalChecked()));
        return;
    }

    if (!args[0]->IsObject())
    {
        isolate->ThrowException(v8::Exception::TypeError(v8::String::NewFromUtf8(isolate,
            "Wrong arguments types, expected (encryptedString: Buffer)", v8::NewStringType::kNormal).ToLocalChecked()));
        return;
    }

    v8::Local<v8::Object> encryptedString = args[0]->ToObject(isolate->GetCurrentContext()).ToLocalChecked();
    uint8_t* data = reinterpret_cast<uint8_t*>(node::Buffer::Data(encryptedString));
    size_t length = node::Buffer::Length(encryptedString);
    std::string outputString;

    if (!DecryptString(std::vector<uint8_t>(data, data + length), &outputString))
    {
        isolate->ThrowException(v8::Exception::Error(v8::String::NewFromUtf8(isolate, "Decryption failed", v8::NewStringType::kNormal).ToLocalChecked()));
        return;
    }

    v8::Local<v8::String> returnString;
    if (v8::String::NewFromUtf8(isolate, outputString.c_str(), v8::NewStringType::kNormal, outputString.length()).ToLocal(&returnString))
        args.GetReturnValue().Set(returnString);
    else
        isolate->ThrowException(v8::Exception::TypeError(v8::String::NewFromUtf8(isolate, "Output string creation failed", v8::NewStringType::kNormal).ToLocalChecked()));
}

NODE_MODULE_INIT(/*exports, module, context*/)
{
    auto setExport = [&](char const* name, v8::FunctionCallback callback)
    {
        v8::Isolate* isolate = context->GetIsolate();
        exports->Set(context,
            v8::String::NewFromUtf8(isolate, name, v8::NewStringType::kInternalized).ToLocalChecked(),
            v8::FunctionTemplate::New(isolate, callback)->GetFunction(context).ToLocalChecked()).Check();
    };

    setExport("launchGame", LaunchGame);
    setExport("encryptString", EncryptJsString);
    setExport("decryptString", DecryptJsString);
}
