import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const markdownContent = `# 🎯 Scénario de Démonstration I4TK Knowledge Network
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

### 2.4 Tableau Périodique de Régulation (1 min)
- **Navigation** : Aller dans "Tools" → "Periodic Table"
- **Ce qu'on montre** :
  - **54 éléments réglementaires** organisés comme un tableau périodique
  - **6 catégories thématiques** avec codes couleur :
    - 🟢 **Cadre institutionnel** (vert) - Structures de gouvernance
    - 🟢 **Législation des plateformes** (vert) - Cadres légaux
    - 🔴 **Droits humains & État de droit** (rouge) - Mécanismes de protection
    - 🔵 **Gouvernance des contenus** (bleu) - Modération des contenus
    - 🔵 **Risques systémiques** (bleu) - Évaluation des risques
    - 🔵 **Design pro-social** (bleu) - Design pour le bien commun
  - **Clic sur un élément** : Affiche description détaillée et documents liés
  - **Lien avec les documents** : Chaque document peut être tagué avec les éléments pertinents

**Script** :
> "Le Tableau Périodique de Régulation est un outil unique qui catégorise 54 concepts réglementaires en 6 familles. En cliquant sur un élément, on voit sa description et les documents de la bibliothèque qui y sont associés."

### 2.5 Regulation Pathways (30 sec)
- **Navigation** : Aller dans "Tools" → "Regulation Pathways"
- **Ce qu'on montre** :
  - Création de parcours réglementaires combinant plusieurs éléments
  - Visualisation des connexions entre concepts

**Script** :
> "Les Regulation Pathways permettent de créer des parcours combinant plusieurs éléments du tableau périodique pour visualiser des approches réglementaires complètes."

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
  - **AI Auto-Tagging** (lien avec le Tableau Périodique) :
    - Cliquer sur "Suggest Tags with AI" (bouton avec icône ✨)
    - **Pipeline en 5 étapes** :
      1. Extraction du texte PDF depuis IPFS
      2. Génération d'embeddings sémantiques (TensorFlow.js)
      3. Pré-sélection des candidats par similarité cosinus
      4. Validation GPT-4o-mini avec scores de confiance
      5. Affichage des suggestions (seuil ≥60%)
    - Badges colorés : 🟢 vert (≥80%) | 🟡 jaune (60-79%)
    - Possibilité d'accepter individuellement ou "Apply All"
  - **Upload vers IPFS** : Document stocké de façon décentralisée
  - **Blockchain** : Mint du token ERC1155 sur Sepolia

**Script** :
> "L'AI Auto-Tagging analyse le contenu du document et suggère les éléments pertinents du Tableau Périodique. Le système combine embeddings sémantiques et GPT-4o-mini pour des suggestions précises avec niveaux de confiance. Le PDF est stocké sur IPFS et un token ERC1155 est créé sur la blockchain."

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
1. ✅ **Tableau Périodique** : 54 éléments réglementaires en 6 catégories pour catégoriser la recherche
2. ✅ **AI Auto-Tagging** : Suggestion automatique des éléments du tableau périodique avec GPT-4o-mini
3. ✅ **Collaboration** : Système de validation peer-to-peer (4 validations)
4. ✅ **IA Intégrée** : Assistant RAG pour la recherche intelligente avec citations
5. ✅ **Blockchain** : Propriété intellectuelle tokenisée (ERC1155) avec distribution automatique
6. ✅ **Décentralisation** : Documents sur IPFS, métadonnées immuables on-chain
7. ✅ **Multilingue** : Support français/anglais natif

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
`;

const WalkThrough = () => {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-10">
        <div className="prose prose-lg max-w-none
                      prose-headings:text-gray-900
                      prose-h1:text-4xl prose-h1:font-bold prose-h1:mb-4
                      prose-h2:text-3xl prose-h2:font-semibold prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-2
                      prose-h3:text-2xl prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3
                      prose-p:text-gray-700 prose-p:leading-relaxed
                      prose-li:text-gray-700
                      prose-strong:text-gray-900 prose-strong:font-semibold
                      prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:italic prose-blockquote:text-gray-700
                      prose-code:text-blue-600 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded
                      prose-hr:my-8 prose-hr:border-gray-300
                      prose-ul:list-disc prose-ul:ml-6
                      prose-ol:list-decimal prose-ol:ml-6
                      prose-a:text-blue-600 prose-a:underline">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {markdownContent}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default WalkThrough;
