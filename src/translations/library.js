// Library feature translations — EN (default) / FR / ES
const libraryTranslations = {

  en: {
    // ── Dates & generic ──────────────────────────────────────────────
    unknownDate: 'Unknown date',
    unknownAuthor: 'Unknown author',
    untitled: 'Untitled',
    createdOn: 'Created:',
    dateLocale: 'en-US',

    // ── Loading / errors ─────────────────────────────────────────────
    errorTitle: 'Error',
    loadError: 'Failed to load documents: ',
    noDescription: 'No description available',
    noDocumentsFound: 'No document found',
    noDocumentsSearch: 'No results for this search.',
    noDocumentsPending: 'Documents will appear here once submitted.',

    // ── Status badges ────────────────────────────────────────────────
    statusPending: 'Pending',
    statusPublished: 'Published',
    statusFailed: 'Failed',
    statusAdminReviewed: 'Admin Reviewed',

    // ── Admin toolbar (NetworkPublications) ──────────────────────────
    recoverMissing: 'Recover Missing Document',

    // ── NetworkPublications admin validation panel (LibrarianSpace) ──
    pendingValidationTitle: 'Documents pending validation',
    refresh: 'Refresh',
    noDocsPending: 'No documents pending validation.',
    approve: 'Approve & Publish',
    reject: 'Reject',
    promoteToPeerReview: 'Promote to peer review',

    // ── LibrarianSpace reject modal ───────────────────────────────────
    rejectModalTitle: 'Rejection reason (optional)',
    rejectPlaceholder: 'Explain why this document is rejected...',
    cancel: 'Cancel',
    confirmReject: 'Confirm rejection',

    // ── LibrarianSpace feedback messages ─────────────────────────────
    feedbackApproved: 'Document approved and published.',
    feedbackApproveError: 'Error during approval.',
    feedbackRejected: 'Document rejected.',
    feedbackRejectError: 'Error during rejection.',
    feedbackPromoted: 'Document transferred to the peer review workflow.',
    feedbackPromoteError: 'Error during transfer to peer review.',

    // ── LibrarianSpace role names ─────────────────────────────────────
    roleContributor: 'Contributor',
    roleValidator: 'Validator',
    roleAdmin: 'Administrator',

    // ── SubmitContribution — page header ─────────────────────────────
    submitPageTitle: 'Submit content for I4TK review',
    submitPageSubtitle: 'Fill in the form below. At submission you can choose between the peer review process or admin validation.',

    // ── SubmitContribution — transaction status ───────────────────────
    txInProgress: 'Transaction in progress',
    txSubmitted: 'Transaction submitted',
    txHashLabel: 'Transaction hash:',
    peerReviewSuccess: 'Document successfully submitted via peer review!',

    // ── SubmitContribution — error messages ───────────────────────────
    fieldRequired: 'Please fill all required fields (document, title, authors, programme).',
    insufficientFunds: 'Insufficient funds. You need Sepolia ETH for gas fees.',
    txRejected: 'Transaction cancelled by user.',
    submissionError: 'An error occurred during submission',
    centralizedError: 'Error during submission: ',
    tokenIdWarning: 'Document saved but the tokenId could not be extracted automatically. Transaction hash: {txHash}. Please contact an administrator.',
    processingError: 'Error during processing: ',

    // ── SubmitContribution — form labels & placeholders ───────────────
    fieldTitle: 'Title',
    fieldAuthors: 'Authors',
    fieldAuthorsSeparator: 'Enter authors separated by commas',
    fieldDescription: 'Description',
    fieldProgramme: 'Programme',
    fieldCollection: 'Collection',
    fieldCategories: 'Categories',
    fieldGeography: 'Geographic area',
    geographyNote: 'All regions are selected by default. Uncheck non-applicable regions.',
    fieldReferences: 'Bibliographic references',
    selectProgramme: 'Select a programme',
    selectCollection: 'Select a collection (optional)',

    // ── SubmitContribution — submit button ────────────────────────────
    submitBtn: 'Submit contribution →',
    submittingBtn: 'Submitting...',

    // ── SubmitContribution — admin validation success screen ──────────
    successTitle: 'Contribution submitted!',
    successDesc: 'Your document has been successfully submitted and is awaiting admin validation.',
    successSignalPrompt: 'Please introduce your submission to the Network via Signal',
    successSignalNote: 'Once approved, an admin will proceed to its publication.',
    submitAnother: 'Submit another contribution',

    // ── SubmitContribution — choice modal ─────────────────────────────
    choiceTitle: 'Choose submission mode',
    choiceSubtitle: 'How would you like to submit your contribution?',
    choicePeerReviewTitle: 'Peer review (recommended)',
    choicePeerReviewDesc: 'Your document is recorded on the blockchain and submitted for peer review. 4 validators must approve it before publication.',
    learnMore: 'Learn more →',
    submitViaPeerReview: 'Submit via peer review',
    walletRequired: 'A wallet must be connected for this path.',
    choiceAdminTitle: 'Admin validation',
    choiceAdminDesc: 'Your document is submitted pending validation by an I4TK administrator. Once approved, an admin will publish it.',
    submitForAdmin: 'Submit for admin validation',

    // ── SubmitContribution — network help ─────────────────────────────
    needSepoliaTitle: 'Need Sepolia ETH?',
    needSepoliaDesc: 'To submit a document, you need ETH on the Sepolia test network. Here is how to get some:',
    faucetStep1: 'Visit the Sepolia faucet (Alchemy or Infura)',
    faucetStep2: 'Enter your wallet address',
    faucetStep3: 'Receive free test ETH',
    getSepoliaETH: 'Get Sepolia ETH →',

    // ── Peer review benefits modal ────────────────────────────────────
    benefitsTitle: 'Why peer review?',
    benefitsSubtitle: "The I4TK decentralised validation process",
    benefitsGovernanceTitle: 'Decentralised governance via tokens',
    benefitsGovernanceDesc: "Each published document generates I4TK tokens. These tokens are not speculative — they represent a real contribution to collective knowledge. At publication, 40% go to the document's creator and 60% are distributed proportionally to referenced documents, thereby rewarding the entire knowledge network the contribution builds upon.",
    benefitsPeerTitle: 'Peer review by 4 independent validators',
    benefitsPeerDesc: 'Before any publication, your document is reviewed by 4 validator members of the I4TK network. This process is entirely decentralised: no central authority can arbitrarily block or accelerate a publication. Each validation is recorded on the blockchain and publicly verifiable.',
    benefitsTraceTitle: 'Full traceability of submissions and validations',
    benefitsTraceDesc: 'Every stage of a document\'s lifecycle — submission, successive validations, publication — is timestamped and recorded on the blockchain. It is possible at any time to verify who validated what, and when, guaranteeing complete transparency of the network\'s editorial process.',
    benefitsGenealogy: 'Document genealogy',
    benefitsGenealogyDesc: 'Thanks to bibliographic references recorded on-chain, each document is part of an intellectual lineage tree. The I4TK library allows you to navigate this genealogy: see which works inspired a document, and which documents were in turn inspired by it. It is a living map of the network\'s knowledge production.',
    benefitsImmutable: 'Immutable record',
    benefitsImmutableDesc: 'Once published, your document is permanently recorded on the Sepolia network. It cannot be modified or deleted — guaranteeing the long-term integrity of the network\'s scientific output.',
    benefitsWalletTitle: 'How to participate in peer review?',
    benefitsWalletDesc: 'To submit a document via peer review, you need an Ethereum wallet. MetaMask is the most widely used and easiest-to-configure browser extension.',
    downloadMetamask: 'Download MetaMask →',
    benefitsWalletSend: 'Once your wallet is created, send your wallet address to the I4TK team to be assigned your contribution rights:',
    understood: 'Got it',
  },

  fr: {
    // ── Dates & generic ──────────────────────────────────────────────
    unknownDate: 'Date inconnue',
    unknownAuthor: 'Auteur inconnu',
    untitled: 'Sans titre',
    createdOn: 'Créé le :',
    dateLocale: 'fr-FR',

    // ── Loading / errors ─────────────────────────────────────────────
    errorTitle: 'Erreur',
    loadError: 'Erreur lors du chargement des documents : ',
    noDescription: 'Pas de description disponible',
    noDocumentsFound: 'Aucun document trouvé',
    noDocumentsSearch: 'Aucun résultat pour cette recherche.',
    noDocumentsPending: 'Les documents apparaîtront ici une fois soumis.',

    // ── Status badges ────────────────────────────────────────────────
    statusPending: 'En attente',
    statusPublished: 'Publié',
    statusFailed: 'Échoué',
    statusAdminReviewed: 'Validé admin',

    // ── Admin toolbar ────────────────────────────────────────────────
    recoverMissing: 'Récupérer Document Manquant',

    // ── Admin validation panel ────────────────────────────────────────
    pendingValidationTitle: 'Documents en attente de validation',
    refresh: 'Actualiser',
    noDocsPending: 'Aucun document en attente de validation.',
    approve: 'Approuver & Publier',
    reject: 'Rejeter',
    promoteToPeerReview: 'Promouvoir en peer review',

    // ── Reject modal ──────────────────────────────────────────────────
    rejectModalTitle: 'Motif de rejet (optionnel)',
    rejectPlaceholder: 'Expliquer pourquoi ce document est rejeté...',
    cancel: 'Annuler',
    confirmReject: 'Confirmer le rejet',

    // ── Feedback messages ─────────────────────────────────────────────
    feedbackApproved: 'Document approuvé et publié.',
    feedbackApproveError: "Erreur lors de l'approbation.",
    feedbackRejected: 'Document rejeté.',
    feedbackRejectError: 'Erreur lors du rejet.',
    feedbackPromoted: 'Document transféré vers le workflow peer review.',
    feedbackPromoteError: 'Erreur lors du transfert vers le peer review.',

    // ── Role names ────────────────────────────────────────────────────
    roleContributor: 'Contributeur',
    roleValidator: 'Validateur',
    roleAdmin: 'Administrateur',

    // ── Page header ───────────────────────────────────────────────────
    submitPageTitle: 'Soumettre du contenu pour révision I4TK',
    submitPageSubtitle: 'Remplissez le formulaire ci-dessous. Au moment de la soumission, vous pourrez choisir entre le processus de peer review ou une admin validation.',

    // ── Transaction status ────────────────────────────────────────────
    txInProgress: 'Transaction en cours',
    txSubmitted: 'Transaction soumise',
    txHashLabel: 'Hash de transaction :',
    peerReviewSuccess: 'Document soumis avec succès via peer review !',

    // ── Error messages ────────────────────────────────────────────────
    fieldRequired: 'Veuillez remplir tous les champs requis (document, titre, auteurs, programme).',
    insufficientFunds: "Fonds insuffisants. Vous avez besoin d'ETH Sepolia pour les frais de gas.",
    txRejected: "Transaction annulée par l'utilisateur.",
    submissionError: 'Une erreur est survenue lors de la soumission',
    centralizedError: 'Erreur lors de la soumission : ',
    tokenIdWarning: "Document sauvegardé mais le tokenId n'a pas pu être extrait automatiquement. Transaction hash : {txHash}. Veuillez contacter un administrateur.",
    processingError: 'Erreur lors du traitement : ',

    // ── Form labels ───────────────────────────────────────────────────
    fieldTitle: 'Titre',
    fieldAuthors: 'Auteurs',
    fieldAuthorsSeparator: 'Entrez les auteurs séparés par des virgules',
    fieldDescription: 'Description',
    fieldProgramme: 'Programme',
    fieldCollection: 'Collection',
    fieldCategories: 'Catégories',
    fieldGeography: 'Zone géographique',
    geographyNote: 'Toutes les régions sont sélectionnées par défaut. Décochez les régions non concernées.',
    fieldReferences: 'Références bibliographiques',
    selectProgramme: 'Sélectionner un programme',
    selectCollection: 'Sélectionner une collection (optionnel)',

    // ── Submit button ─────────────────────────────────────────────────
    submitBtn: 'Soumettre la contribution →',
    submittingBtn: 'Soumission en cours...',

    // ── Success screen ────────────────────────────────────────────────
    successTitle: 'Contribution soumise !',
    successDesc: "Votre document a été soumis avec succès et est en attente d'admin validation.",
    successSignalPrompt: 'Veuillez présenter votre soumission au réseau via Signal',
    successSignalNote: "Une fois approuvé, un admin procédera à sa publication.",
    submitAnother: 'Soumettre une autre contribution',

    // ── Choice modal ──────────────────────────────────────────────────
    choiceTitle: 'Choisir le mode de soumission',
    choiceSubtitle: 'Comment souhaitez-vous soumettre votre contribution ?',
    choicePeerReviewTitle: 'Peer review (recommandé)',
    choicePeerReviewDesc: "Votre document est enregistré sur la blockchain et soumis à la révision par les pairs. 4 validateurs devront l'approuver avant publication.",
    learnMore: 'En savoir plus →',
    submitViaPeerReview: 'Soumettre via peer review',
    walletRequired: 'Un wallet doit être connecté pour ce chemin.',
    choiceAdminTitle: 'Admin validation',
    choiceAdminDesc: "Votre document est soumis en attente de validation par un administrateur I4TK. Une fois approuvé, un admin procédera à sa publication.",
    submitForAdmin: 'Soumettre pour admin validation',

    // ── Network help ──────────────────────────────────────────────────
    needSepoliaTitle: "Besoin d'ETH Sepolia ?",
    needSepoliaDesc: "Pour soumettre un document, vous avez besoin d'ETH sur le réseau de test Sepolia. Voici comment en obtenir :",
    faucetStep1: 'Visitez le faucet Sepolia (Alchemy ou Infura)',
    faucetStep2: 'Entrez votre adresse de portefeuille',
    faucetStep3: "Recevez des ETH de test gratuits",
    getSepoliaETH: "Obtenir des ETH Sepolia →",

    // ── Benefits modal ────────────────────────────────────────────────
    benefitsTitle: 'Pourquoi le peer review ?',
    benefitsSubtitle: "Le processus de validation décentralisé d'I4TK",
    benefitsGovernanceTitle: 'Gouvernance décentralisée par les tokens',
    benefitsGovernanceDesc: "Chaque document publié génère des tokens I4TK. Ces tokens ne sont pas spéculatifs : ils matérialisent une contribution réelle à la connaissance collective. À la publication, 40 % reviennent au créateur du document et 60 % sont distribués proportionnellement aux documents référencés, récompensant ainsi l'ensemble du réseau de savoir sur lequel s'appuie la contribution.",
    benefitsPeerTitle: 'Peer review par 4 validateurs indépendants',
    benefitsPeerDesc: "Avant toute publication, votre document est examiné par 4 membres validateurs du réseau I4TK. Ce processus est entièrement décentralisé : aucune autorité centrale ne peut bloquer ou accélérer arbitrairement une publication. Chaque validation est enregistrée sur la blockchain et publiquement vérifiable.",
    benefitsTraceTitle: 'Traçabilité complète des soumissions et validations',
    benefitsTraceDesc: "Chaque étape du cycle de vie d'un document — soumission, validations successives, publication — est horodatée et inscrite sur la blockchain. Il est possible à tout moment de vérifier qui a validé quoi, et quand, garantissant une transparence totale du processus éditorial du réseau.",
    benefitsGenealogy: 'Généalogie des documents',
    benefitsGenealogyDesc: "Grâce aux références bibliographiques enregistrées on-chain, chaque document s'inscrit dans un arbre de filiation intellectuelle. La bibliothèque I4TK permet de naviguer cette généalogie : voir quels travaux ont inspiré un document, et quels documents s'en sont inspirés à leur tour. C'est une cartographie vivante de la production de connaissance du réseau.",
    benefitsImmutable: 'Enregistrement immuable',
    benefitsImmutableDesc: "Une fois publié, votre document est inscrit de façon permanente sur le réseau Sepolia. Il ne peut pas être modifié ni supprimé — garantissant l'intégrité à long terme de la production scientifique du réseau.",
    benefitsWalletTitle: 'Comment participer au peer review ?',
    benefitsWalletDesc: "Pour soumettre un document via le peer review, vous avez besoin d'un wallet Ethereum. MetaMask est l'extension de navigateur la plus utilisée et la plus simple à configurer.",
    downloadMetamask: 'Télécharger MetaMask →',
    benefitsWalletSend: "Une fois votre wallet créé, envoyez votre adresse de wallet à l'équipe I4TK pour qu'elle vous attribue vos droits de contribution :",
    understood: 'Compris',
  },

  es: {
    // ── Dates & generic ──────────────────────────────────────────────
    unknownDate: 'Fecha desconocida',
    unknownAuthor: 'Autor desconocido',
    untitled: 'Sin título',
    createdOn: 'Creado el:',
    dateLocale: 'es-ES',

    // ── Loading / errors ─────────────────────────────────────────────
    errorTitle: 'Error',
    loadError: 'Error al cargar documentos: ',
    noDescription: 'Sin descripción disponible',
    noDocumentsFound: 'No se encontraron documentos',
    noDocumentsSearch: 'Sin resultados para esta búsqueda.',
    noDocumentsPending: 'Los documentos aparecerán aquí una vez enviados.',

    // ── Status badges ────────────────────────────────────────────────
    statusPending: 'Pendiente',
    statusPublished: 'Publicado',
    statusFailed: 'Fallido',
    statusAdminReviewed: 'Revisado por admin',

    // ── Admin toolbar ────────────────────────────────────────────────
    recoverMissing: 'Recuperar documento faltante',

    // ── Admin validation panel ────────────────────────────────────────
    pendingValidationTitle: 'Documentos pendientes de validación',
    refresh: 'Actualizar',
    noDocsPending: 'Ningún documento pendiente de validación.',
    approve: 'Aprobar y publicar',
    reject: 'Rechazar',
    promoteToPeerReview: 'Promover a revisión por pares',

    // ── Reject modal ──────────────────────────────────────────────────
    rejectModalTitle: 'Motivo de rechazo (opcional)',
    rejectPlaceholder: 'Explique por qué se rechaza este documento...',
    cancel: 'Cancelar',
    confirmReject: 'Confirmar rechazo',

    // ── Feedback messages ─────────────────────────────────────────────
    feedbackApproved: 'Documento aprobado y publicado.',
    feedbackApproveError: 'Error durante la aprobación.',
    feedbackRejected: 'Documento rechazado.',
    feedbackRejectError: 'Error durante el rechazo.',
    feedbackPromoted: 'Documento transferido al flujo de revisión por pares.',
    feedbackPromoteError: 'Error durante la transferencia a revisión por pares.',

    // ── Role names ────────────────────────────────────────────────────
    roleContributor: 'Contribuidor',
    roleValidator: 'Validador',
    roleAdmin: 'Administrador',

    // ── Page header ───────────────────────────────────────────────────
    submitPageTitle: 'Enviar contenido para revisión I4TK',
    submitPageSubtitle: 'Complete el formulario a continuación. En el momento del envío podrá elegir entre el proceso de revisión por pares o la validación de administrador.',

    // ── Transaction status ────────────────────────────────────────────
    txInProgress: 'Transacción en curso',
    txSubmitted: 'Transacción enviada',
    txHashLabel: 'Hash de transacción:',
    peerReviewSuccess: '¡Documento enviado con éxito mediante revisión por pares!',

    // ── Error messages ────────────────────────────────────────────────
    fieldRequired: 'Por favor, complete todos los campos requeridos (documento, título, autores, programa).',
    insufficientFunds: 'Fondos insuficientes. Necesita ETH Sepolia para las comisiones de gas.',
    txRejected: 'Transacción cancelada por el usuario.',
    submissionError: 'Se produjo un error durante el envío',
    centralizedError: 'Error durante el envío: ',
    tokenIdWarning: 'Documento guardado pero no se pudo extraer el tokenId automáticamente. Hash de transacción: {txHash}. Contacte a un administrador.',
    processingError: 'Error durante el procesamiento: ',

    // ── Form labels ───────────────────────────────────────────────────
    fieldTitle: 'Título',
    fieldAuthors: 'Autores',
    fieldAuthorsSeparator: 'Ingrese los autores separados por comas',
    fieldDescription: 'Descripción',
    fieldProgramme: 'Programa',
    fieldCollection: 'Colección',
    fieldCategories: 'Categorías',
    fieldGeography: 'Área geográfica',
    geographyNote: 'Todas las regiones están seleccionadas por defecto. Desmarque las regiones no aplicables.',
    fieldReferences: 'Referencias bibliográficas',
    selectProgramme: 'Seleccionar un programa',
    selectCollection: 'Seleccionar una colección (opcional)',

    // ── Submit button ─────────────────────────────────────────────────
    submitBtn: 'Enviar contribución →',
    submittingBtn: 'Enviando...',

    // ── Success screen ────────────────────────────────────────────────
    successTitle: '¡Contribución enviada!',
    successDesc: 'Su documento ha sido enviado con éxito y está pendiente de validación de administrador.',
    successSignalPrompt: 'Por favor, presente su envío a la red a través de Signal',
    successSignalNote: 'Una vez aprobado, un administrador procederá a su publicación.',
    submitAnother: 'Enviar otra contribución',

    // ── Choice modal ──────────────────────────────────────────────────
    choiceTitle: 'Elegir modo de envío',
    choiceSubtitle: '¿Cómo desea enviar su contribución?',
    choicePeerReviewTitle: 'Revisión por pares (recomendado)',
    choicePeerReviewDesc: 'Su documento se registra en la blockchain y se somete a revisión por pares. 4 validadores deberán aprobarlo antes de la publicación.',
    learnMore: 'Más información →',
    submitViaPeerReview: 'Enviar mediante revisión por pares',
    walletRequired: 'Se requiere una billetera conectada para esta ruta.',
    choiceAdminTitle: 'Validación por administrador',
    choiceAdminDesc: 'Su documento se envía pendiente de validación por un administrador de I4TK. Una vez aprobado, un admin procederá a su publicación.',
    submitForAdmin: 'Enviar para validación admin',

    // ── Network help ──────────────────────────────────────────────────
    needSepoliaTitle: '¿Necesita ETH Sepolia?',
    needSepoliaDesc: 'Para enviar un documento necesita ETH en la red de prueba Sepolia. Así puede obtenerlo:',
    faucetStep1: 'Visite el faucet de Sepolia (Alchemy o Infura)',
    faucetStep2: 'Ingrese su dirección de billetera',
    faucetStep3: 'Reciba ETH de prueba gratuitos',
    getSepoliaETH: 'Obtener ETH Sepolia →',

    // ── Benefits modal ────────────────────────────────────────────────
    benefitsTitle: '¿Por qué la revisión por pares?',
    benefitsSubtitle: 'El proceso de validación descentralizado de I4TK',
    benefitsGovernanceTitle: 'Gobernanza descentralizada mediante tokens',
    benefitsGovernanceDesc: 'Cada documento publicado genera tokens I4TK. Estos tokens no son especulativos: representan una contribución real al conocimiento colectivo. En la publicación, el 40% va al creador del documento y el 60% se distribuye proporcionalmente a los documentos referenciados, recompensando así toda la red de conocimiento en la que se apoya la contribución.',
    benefitsPeerTitle: 'Revisión por pares por 4 validadores independientes',
    benefitsPeerDesc: 'Antes de cualquier publicación, su documento es revisado por 4 miembros validadores de la red I4TK. Este proceso es completamente descentralizado: ninguna autoridad central puede bloquear o acelerar arbitrariamente una publicación. Cada validación se registra en la blockchain y es verificable públicamente.',
    benefitsTraceTitle: 'Trazabilidad completa de envíos y validaciones',
    benefitsTraceDesc: 'Cada etapa del ciclo de vida de un documento — envío, validaciones sucesivas, publicación — está fechada y registrada en la blockchain. En cualquier momento es posible verificar quién validó qué y cuándo, garantizando una transparencia total del proceso editorial de la red.',
    benefitsGenealogy: 'Genealogía de documentos',
    benefitsGenealogyDesc: 'Gracias a las referencias bibliográficas registradas on-chain, cada documento forma parte de un árbol de filiación intelectual. La biblioteca I4TK permite navegar esta genealogía: ver qué trabajos inspiraron un documento y qué documentos se inspiraron en él. Es un mapa vivo de la producción de conocimiento de la red.',
    benefitsImmutable: 'Registro inmutable',
    benefitsImmutableDesc: 'Una vez publicado, su documento queda registrado permanentemente en la red Sepolia. No puede modificarse ni eliminarse, garantizando la integridad a largo plazo de la producción científica de la red.',
    benefitsWalletTitle: '¿Cómo participar en la revisión por pares?',
    benefitsWalletDesc: 'Para enviar un documento mediante revisión por pares necesita una billetera Ethereum. MetaMask es la extensión de navegador más utilizada y fácil de configurar.',
    downloadMetamask: 'Descargar MetaMask →',
    benefitsWalletSend: 'Una vez creada su billetera, envíe su dirección al equipo I4TK para que le asignen sus derechos de contribución:',
    understood: 'Entendido',
  },
};

export default libraryTranslations;
