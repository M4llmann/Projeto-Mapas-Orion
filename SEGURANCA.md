# 🔒 Segurança - Configuração de Credenciais

## ⚠️ IMPORTANTE: Dados Sensíveis

Este projeto foi configurado para **NÃO** expor credenciais sensíveis no GitHub.

## 📋 Configuração Inicial

### 1. Criar arquivo .env

Copie o arquivo de exemplo e preencha com suas credenciais:

```bash
cp .env.example .env
```

### 2. Preencher o arquivo .env

Abra o arquivo `.env` e preencha com suas credenciais do Firebase:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=sua_api_key_aqui
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_project_id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=seu_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_project_id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=seu_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=seu_measurement_id
```

### 3. Obter credenciais do Firebase

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá em **Configurações do Projeto** (ícone de engrenagem)
4. Role até **Seus apps** e selecione o app web
5. Copie as credenciais para o arquivo `.env`

## 🔐 Arquivos Protegidos

Os seguintes arquivos estão no `.gitignore` e **NÃO** serão commitados:

- `.env` - Suas credenciais reais
- `.env.local` - Variáveis locais
- `.env.production` - Variáveis de produção
- `.env.development` - Variáveis de desenvolvimento

## ✅ Arquivos Seguros para Commit

Estes arquivos podem ser commitados com segurança:

- `.env.example` - Template sem credenciais reais
- `app.config.js` - Configuração que lê do .env
- `firebase.js` - Código que usa variáveis de ambiente

## 🚨 Se Você Já Committou Credenciais

Se você já fez commit das credenciais no GitHub:

1. **IMEDIATAMENTE** altere todas as credenciais no Firebase Console
2. Revogue as chaves antigas
3. Gere novas credenciais
4. Atualize o arquivo `.env` com as novas credenciais
5. Remova o histórico do Git (se necessário):

```bash
# ATENÇÃO: Isso reescreve o histórico do Git
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch firebase.js" \
  --prune-empty --tag-name-filter cat -- --all
```

## 📝 Boas Práticas

- ✅ **NUNCA** commite o arquivo `.env`
- ✅ **SEMPRE** use `.env.example` como template
- ✅ **REVISE** os arquivos antes de fazer commit
- ✅ **ROTACIONE** as credenciais periodicamente
- ✅ **USE** diferentes credenciais para desenvolvimento e produção

## 🔍 Verificação

Para verificar se suas credenciais estão seguras:

```bash
# Verifique se .env está no .gitignore
cat .gitignore | grep .env

# Verifique se há credenciais hardcoded no código
grep -r "AIzaSy" . --exclude-dir=node_modules
```

Se encontrar credenciais hardcoded, remova-as imediatamente!

