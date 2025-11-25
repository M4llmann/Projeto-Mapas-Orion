# ⚙️ Configuração do Arquivo .env

## 📝 Passo a Passo

### 1. Criar o arquivo .env

Crie um arquivo chamado `.env` na raiz do projeto com o seguinte conteúdo:

```env
# Configurações do Firebase
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyBiCpD_0_9j54TBhBxZ_KqmjMqNarHMSyc
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=orion-geo-hml.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=orion-geo-hml
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=orion-geo-hml.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=926755195982
EXPO_PUBLIC_FIREBASE_APP_ID=1:926755195982:web:040b5ce826935912e1871f
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-CS2XY03PX4
```

### 2. Instalar dependências

```bash
npm install --legacy-peer-deps
```

### 3. Reiniciar o servidor

```bash
npm start -- --reset-cache
```

## ✅ Verificação

Após criar o `.env`, o projeto deve funcionar normalmente. As credenciais agora estão protegidas e não serão commitadas no Git.

## 🔒 Segurança

- ✅ O arquivo `.env` está no `.gitignore`
- ✅ As credenciais não aparecem mais no código
- ✅ Apenas o template `.env.example` será commitado

