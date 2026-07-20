# AnotAi

Checklist diário da operação, com login por CPF e área de administração para criar usuários e trocar senhas.

Criado por **Giovanni Brochini**.

## Como funciona

- `index.html` — tela de login (CPF + senha) e, na aba "Primeiro acesso", a criação da conta de administrador.
- `app.html` — o checklist do dia (só abre com login válido).
- `settings.html` — troca da própria senha para qualquer usuário; para o administrador, também a criação de novos usuários e a lista de quem tem acesso.
- `firebase-init.js` — configuração e funções de acesso ao Firebase (Auth + Firestore).
- `firestore.rules` — regras de segurança do banco.

O login usa CPF, mas o Firebase Authentication exige um formato de e-mail por baixo dos panos —
por isso o CPF é convertido internamente em algo como `cpf44208225890@notavel.app`. Isso é só
um detalhe técnico: ninguém loga com e-mail, só com CPF e senha.

**Nenhuma senha real é guardada no código.** A conta de administrador é criada por você mesmo,
digitando o CPF e a senha diretamente na tela de "Primeiro acesso" — o Firebase cuida de guardar
isso com segurança (nunca em texto puro, nem aqui, nem no repositório).

Assim que existir um administrador, a aba "Primeiro acesso" some da tela de login para todo mundo
— a partir daí, só o administrador cria contas novas, pela página de Configurações.

## Frequência das tarefas

Ao adicionar uma tarefa em `app.html`, dá para marcar em quais dias da semana ela deve aparecer
(seção "Repetir"). Sem nenhum dia marcado, a tarefa aparece todo dia — esse é o comportamento
padrão. As tarefas que não se aplicam ao dia atual simplesmente não entram na lista nem na conta
do progresso.

## Instalar como app no celular (PWA)

O site tem um `manifest.json` e um `sw.js` (service worker), então no Android/Chrome deve aparecer
a opção "Adicionar à tela inicial" / "Instalar app" sozinha ao abrir o site pelo celular. No iPhone
(Safari), use o menu de compartilhamento → "Adicionar à Tela de Início" (o ícone final fica mais
simples que no Android, já que o `favicon.svg` não é convertido automaticamente).

Se você atualizar o site e a mudança não aparecer no celular (o service worker guarda os arquivos
em cache), troque `anotai-v1` para `anotai-v2` (ou qualquer outro nome) no topo do arquivo
[`sw.js`](sw.js) — isso força os aparelhos a buscarem a versão nova.

## Configurar o Firebase (uma vez só)

1. Acesse [console.firebase.google.com](https://console.firebase.google.com) e crie um projeto novo (é gratuito, não pede cartão para o plano padrão "Spark").
2. Em **Build → Authentication → Sign-in method**, ative o provedor **E-mail/senha**.
3. Em **Build → Firestore Database**, clique em **Criar banco de dados** (modo produção).
4. Ainda no Firestore, na aba **Regras**, cole o conteúdo do arquivo [`firestore.rules`](firestore.rules) deste projeto e publique.
5. Em **Configurações do projeto → Seus apps**, adicione um app da Web e copie o objeto de configuração (`apiKey`, `authDomain`, `projectId` etc).
6. Cole esses valores no início do arquivo [`firebase-init.js`](firebase-init.js), no lugar de `"COLE_AQUI"`.

## Rodar localmente

Como o app usa módulos ES (`import`/`export`), não basta abrir o `index.html` direto no navegador
(`file://`) — é preciso servir os arquivos por HTTP. Qualquer servidor estático simples resolve, por exemplo:

```
npx serve .
```

ou, com Python instalado:

```
python -m http.server 8080
```

Depois acesse `http://localhost:8080` e use a aba "Primeiro acesso" para criar a conta de administrador.

## Publicar no GitHub Pages

Depois de subir o repositório para o GitHub, em **Settings → Pages**, escolha a branch `main`
e a pasta raiz (`/`). O site fica disponível em `https://gildoviske.github.io/AnotAi/`.

## Limites conhecidos

- A troca de senha é feita pelo próprio usuário (autoatendimento). O administrador cria contas
  novas com uma senha inicial, mas resetar a senha de alguém que já esqueceu a dela exigiria o
  plano pago do Firebase (Blaze) com uma função de servidor — não foi habilitado por padrão.
- O progresso do checklist (o que já foi marcado no dia) fica salvo no navegador de cada
  dispositivo (`localStorage`), não sincroniza entre aparelhos.
