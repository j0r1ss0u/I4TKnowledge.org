# 🎯 Scénario de Démonstration I4TK Knowledge Network
**Durée : 10 minutes**

---

## 📋 Vue d'ensemble
Démonstration progressive des fonctionnalités selon 4 niveaux d'accès :
1. **Visiteur non authentifié** (1 min)
2. **Membre authentifié** (3 min)
3. **Validateur** (3 min)
4. **Administrateur** (3 min)

---

## 🌐 PARTIE 1 : Visiteur Non Authentifié (1 min)

### Page d'Accueil
- **Ce qu'on montre** : Page d'accueil avec message de bienvenue
- **Message clé** : "Plateforme collaborative pour la recherche en gouvernance numérique"
- **Actions disponibles** :
  - ✅ Créer un compte
  - ✅ Se connecter
  - ❌ Pas d'accès aux documents ou outils

**Script** :
> "I4TK Knowledge Network est une plateforme de gestion des connaissances pour la recherche collaborative. Un visiteur non connecté ne peut que créer un compte ou se connecter. Toutes les fonctionnalités nécessitent une authentification."

---

## 👤 PARTIE 2 : Membre Authentifié (3 min)

### 2.1 Connexion & Tableau de Bord (30 sec)
- **Action** : Se connecter avec un compte Member
- **Ce qu'on montre** : Navigation principale débloquée
- **Fonctionnalités visibles** :
  - 📚 Library (Bibliothèque)
  - 🤖 AI Assistant
  - 🧪 Tools (Regulation Pathways)
  - 📰 News

**Script** :
> "Une fois connecté comme Membre, l'utilisateur accède à toutes les sections principales de la plateforme."

### 2.2 Bibliothèque de Documents (1 min)
- **Navigation** : Aller dans "Library"
- **Ce qu'on montre** :
  - Liste des documents publiés avec métadonnées
  - Filtres par catégorie (Research Paper, Regulation, Guideline, etc.)
  - Recherche sémantique par titre/contenu
  - Visualisation d'un document PDF
  - **Arbre de citations** : Cliquer sur un document pour voir les références (gris, en bas) et descendants (vert, en haut)

**Script** :
> "La bibliothèque contient tous les documents validés. Chaque document affiche ses métadonnées, catégories, et éléments du tableau périodique associés. L'arbre de citations montre en gris les documents référencés (cités) et en vert les documents qui citent celui-ci (descendants)."

### 2.3 Assistant IA RAG (1 min)
- **Navigation** : Aller dans "AI Assistant"
- **Ce qu'on montre** :
  - Interface de chat conversationnel
  - Détection automatique français/anglais
  - **Démo** : Poser une question sur un sujet (ex: "Quelles sont les principales réglementations sur l'IA ?")
  - Affichage de la réponse avec citations des documents pertinents
  - Liens cliquables vers les documents sources

**Script** :
> "L'assistant IA utilise GPT-4o-mini et la recherche sémantique pour répondre aux questions en s'appuyant sur les documents de la bibliothèque. Il détecte automatiquement la langue et fournit des citations précises."

### 2.4 Regulation Pathways (30 sec)
- **Navigation** : Aller dans "Tools" → "Regulation Pathways"
- **Ce qu'on montre** :
  - Carte interactive des réglementations
  - Visualisation des connexions entre documents

**Script** :
> "Les Regulation Pathways visualisent les liens entre les documents réglementaires, permettant de comprendre l'évolution des politiques."

---

## ✅ PARTIE 3 : Validateur (3 min)

### 3.1 Connexion comme Validateur (15 sec)
- **Action** : Se déconnecter et se reconnecter avec un compte Validator
- **Ce qu'on montre** : Nouvelles fonctionnalités débloquées

**Script** :
> "Les Validateurs ont accès à des fonctionnalités supplémentaires pour gérer le processus de validation collaborative."

### 3.2 Soumettre un Document (1 min 15 sec)
- **Navigation** : Library → "Submit Document"
- **Ce qu'on montre** :
  - **Upload PDF** : Glisser-déposer un document
  - **Métadonnées** : Remplir titre, auteurs, catégories
  - **Sélection des références** : Choisir des documents existants référencés
  - **Tags IA automatiques** :
    - Cliquer sur "Suggest Tags with AI"
    - Affichage des éléments du tableau périodique suggérés avec niveau de confiance
    - Badges colorés (vert ≥80%, jaune ≥60%)
    - Possibilité d'accepter/refuser chaque suggestion
  - **Upload vers IPFS** : Document stocké de façon décentralisée
  - **Blockchain** : Mint du token ERC1155 sur Sepolia

**Script** :
> "Un Validateur peut soumettre de nouveaux documents. Le système suggère automatiquement des tags (éléments du tableau périodique) grâce à l'IA. Le PDF est stocké sur IPFS et un token ERC1155 est créé sur la blockchain, établissant la propriété intellectuelle."

### 3.3 Valider un Document Soumis (1 min 15 sec)
- **Navigation** : Library → Network Publications
- **Ce qu'on montre** :
  - Liste des documents en attente de validation
  - Statut de validation (0/4, 1/4, 2/4, 3/4)
  - Barre de progression visuelle
  - **Action** : Cliquer sur "Validate" pour un document
  - **MetaMask** : Confirmation de la transaction blockchain (~30,000 gas)
  - Mise à jour du statut (ex: 0/4 → 1/4)

**Script** :
> "Le système de validation est collaboratif : 4 validations sont nécessaires pour publier un document. Chaque validation est enregistrée sur la blockchain via le smart contract I4TKnetwork. À la 4ème validation, les tokens sont automatiquement distribués : 40% au créateur, 60% aux documents référencés de façon récursive."

### 3.4 Distribution des Tokens (30 sec)
- **Ce qu'on montre** :
  - Expliquer le mécanisme de distribution
  - Montrer le statut "Published" après 4 validations
  - Expliquer que les tokens représentent la contribution intellectuelle

**Script** :
> "Une fois publié, le document reçoit 100 millions de tokens. Si le document référence d'autres travaux, la distribution est automatique et récursive sur toute la chaîne de références, valorisant ainsi toute la lignée de recherche."

---

## 🔧 PARTIE 4 : Administrateur (3 min)

### 4.1 Connexion comme Admin (15 sec)
- **Action** : Se connecter avec un compte Admin
- **Ce qu'on montre** : Section "Admin Tools" visible

**Script** :
> "Les Administrateurs ont un contrôle total sur la plateforme : gestion des utilisateurs, des rôles blockchain, et export des données."

### 4.2 Gestion des Utilisateurs (1 min)
- **Navigation** : Admin Tools → User Management
- **Ce qu'on montre** :
  - Liste de tous les utilisateurs avec rôles Firestore
  - Filtrage par rôle (Admin, Validator, Member)
  - **Action** : Promouvoir un Member en Validator
  - **Synchronisation blockchain** : Option de synchroniser le rôle sur le smart contract
  - **Invitations** : Envoyer un email d'invitation avec SendGrid

**Script** :
> "L'admin peut gérer les rôles dans Firestore et les synchroniser sur la blockchain. Le système d'invitation par email permet d'onboarder de nouveaux chercheurs facilement."

### 4.3 Gestion des Rôles Blockchain (45 sec)
- **Navigation** : Admin Tools → Blockchain Roles
- **Ce qu'on montre** :
  - Interface pour attribuer les rôles on-chain :
    - CONTRIBUTOR_ROLE (peut soumettre)
    - VALIDATOR_ROLE (peut valider)
    - MINTER_ROLE (peut créer des tokens)
    - ADMIN_ROLE (contrôle total)
  - **Action** : Accorder VALIDATOR_ROLE à une adresse
  - **Transaction blockchain** : Confirmation MetaMask

**Script** :
> "Les rôles blockchain sont gérés via le système AccessControl d'OpenZeppelin. L'admin peut accorder/révoquer des permissions directement depuis l'interface, sans avoir à interagir avec Etherscan."

### 4.4 Export CSV & Analytics (45 sec)
- **Navigation** : Admin Tools → Export Library
- **Ce qu'on montre** :
  - Bouton "Export to CSV"
  - Téléchargement d'un fichier CSV avec toutes les métadonnées
  - **Format** : UTF-8 avec BOM, délimiteur point-virgule (Excel-compatible)
  - **Nettoyage automatique** : Suppression des sauts de ligne, remplacement des point-virgules
  - **Colonnes** : Titre, auteurs, catégories, IPFS CID, Token ID, statut de validation, etc.

**Script** :
> "L'export CSV permet d'analyser la bibliothèque dans Excel ou des outils d'analyse de données. Le format est optimisé pour la compatibilité Excel avec encodage UTF-8 et nettoyage automatique des caractères spéciaux."

### 4.5 Monitoring Blockchain (15 sec)
- **Ce qu'on montre** :
  - Liens vers Sepolia Etherscan pour les smart contracts
  - I4TKnetwork : 0xa9870f477E6362E0810948fd87c0398c2c0a4F55
  - I4TKdocToken : 0x06Fc114E58b8Be5d03b5B7b03ab7f0D3C9605288
  - Possibilité de voir toutes les transactions on-chain

**Script** :
> "Tous les événements blockchain sont publics et vérifiables sur Sepolia Etherscan. La plateforme est prête pour un déploiement mainnet futur."

---

## 🎬 CONCLUSION (30 sec)

### Récapitulatif des Points Clés
1. ✅ **Collaboration** : Système de validation peer-to-peer (4 validations)
2. ✅ **IA Intégrée** : Auto-tagging et assistant RAG pour la recherche intelligente
3. ✅ **Blockchain** : Propriété intellectuelle tokenisée (ERC1155) avec distribution automatique
4. ✅ **Décentralisation** : Documents sur IPFS, métadonnées immuables on-chain
5. ✅ **Multilingue** : Support français/anglais natif
6. ✅ **Open Source** : Architecture transparente, smart contracts vérifiables

**Message final** :
> "I4TK Knowledge Network combine gouvernance numérique, intelligence artificielle et blockchain pour créer un écosystème collaboratif transparent où chaque contribution est reconnue et valorisée."

---

## 📌 NOTES POUR LA PRÉSENTATION

### Préparation Technique
- [ ] Avoir 3 comptes prêts : Member, Validator, Admin
- [ ] Préparer un PDF de test à uploader
- [ ] Avoir un document en attente de validation (0/4 ou 1/4)
- [ ] Vérifier que MetaMask est connecté au réseau Sepolia
- [ ] S'assurer d'avoir des SepoliaETH pour les transactions

### Points d'Attention
- **Temps de transaction blockchain** : Prévoir 10-15 secondes d'attente, expliquer pendant ce temps
- **Auto-tagging IA** : Peut prendre 5-10 secondes, expliquer le processus pendant l'attente
- **Upload IPFS** : Peut être lent selon la taille du fichier, préparer un petit PDF (<1MB)

### Questions Anticipées
1. **"Pourquoi utiliser la blockchain ?"**
   → Immuabilité, transparence, distribution automatique des tokens, propriété vérifiable
   
2. **"Combien coûtent les transactions ?"**
   → Sur Sepolia : gratuit (testnet). Sur mainnet : ~0.001-0.005 ETH selon la congestion
   
3. **"Les documents sont-ils vraiment décentralisés ?"**
   → Oui, IPFS via Pinata, pas de point de défaillance central
   
4. **"Peut-on modifier un document après publication ?"**
   → Non, l'immuabilité blockchain garantit l'intégrité du contenu historique

### Variantes de Timing
- **Version courte (5 min)** : Sauter 2.4 (Regulation Pathways) et 4.5 (Monitoring)
- **Version longue (15 min)** : Ajouter NewsBlur, détailler l'architecture technique, montrer le code des smart contracts
