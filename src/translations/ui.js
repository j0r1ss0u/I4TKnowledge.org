// ============================================================
// ui.js — Master UI translation inventory
// All visible text strings for the I4TK application
// Organized by section/component
//
// HOW TO USE:
//   import { ui } from './translations/ui';
//   const t = ui[currentLang] ?? ui.en;
//   then: t.header.tagline, t.home.members, etc.
//
// HOW TO ADD A NEW LANGUAGE:
//   Copy the entire `en` block, paste as new key (e.g. `fr:`),
//   and translate each value. Do not change the keys.
// ============================================================

const ui = {

  // ════════════════════════════════════════════════════════
  // ENGLISH  (reference — do not remove any key)
  // ════════════════════════════════════════════════════════
  en: {

    // ── Shared / common strings ───────────────────────────
    common: {
      cancel:       'Cancel',
      save:         'Save',
      edit:         'Edit',
      delete:       'Delete',
      add:          'Add',
      update:       'Update',
      confirm:      'Confirm',
      close:        'Close',
      loading:      'Loading…',
      error:        'Error',
      success:      'Success',
      yes:          'Yes',
      no:           'No',
      by:           'By:',
      moreInfo:     'More info',
      noData:       'No data available',
      required:     'Required',
      optional:     'Optional',
      search:       'Search',
      filter:       'Filter',
      all:          'All',
      back:         'Back',
      next:         'Next',
      submit:       'Submit',
      send:         'Send',
    },

    // ── Header & navigation ───────────────────────────────
    header: {
      tagline:        'Global knowledge network for an Internet for Trust',
      login:          'Login',
      cancel:         'Cancel',
      menuAriaLabel:  'Main menu',
      nav: {
        home:          'Home',
        about:         'About',
        members:       'Members',
        library:       'Library',
        pressReleases: 'Press Releases',
        forum:         'Forum',
        tools:         'Tools',
        guide:         'Guide',
        draft:         'Draft',
      },
    },

    // ── Home page ─────────────────────────────────────────
    home: {
      stats: {
        members:          'members',
        southNorth:       'South / North',
        civilAcademic:    'Civil Society / Academic',
        publishedDocs:    'Published Documents',
        activeProjects:   'Active Projects',
      },
      cta: {
        title:    'Join Our Network Today!',
        subtitle: 'Fill out the form below to become part of our global knowledge community',
      },
    },

    // ── Search / LibraryRAG (public search) ───────────────
    search: {
      title:        'Search for title, author or content:',
      placeholder:  'Search in the knowledge base…',
      ariaLabel:    'Search',
      relevant:     'relevant',
      noResults:    'No results found',
      error:        'Error performing search',
    },

    // ── About section ─────────────────────────────────────
    about: {
      tabs: {
        events:           'Events',
        founders:         'Founding members',
        tor:              'Terms of reference',
        prai:             'PRAI Partnership',
        focusCentralAm:   'Focus on Central America',
      },
      mission: {
        knowledgeTitle: 'World-class knowledge producers',
        knowledgeDesc:  'Bringing together leading research centers and think tanks',
        collectiveTitle: 'Collective action',
        collectiveDesc:  'Fostering collaboration for better digital governance',
        independentTitle: 'Independent network',
        independentDesc:  'Maintaining autonomy in research and recommendations',
        outputTitle:     'Output-driven',
        outputDesc:      'Focused on producing actionable insights and solutions',
      },
      contact: {
        label: 'Contact us at',
      },
    },

    // ── UNESCO Report tab ─────────────────────────────────
    unesco: {
      title:      'The Regulation of Digital Platforms in Mexico, Central America and the Caribbean',
      openNewTab: 'Open in new tab',
    },

    // ── Events (About > Events tab) ───────────────────────
    events: {
      sectionTitle:    'Our Journey & Milestones',
      manageEvents:    'Manage Events',
      viewTimeline:    'View Timeline',
      addProject:      'Add Project',
      addNewEvent:     'Add New Event',
      communityProject: 'Community Project',
      loginRequired:   'Login required',
      moreInfo:        'More info',
      dateUndefined:   'Date undefined',
      noEvents:        'No events found. Add your first event using the button above.',
      loadError:       'Failed to load events. Please try again.',
      addError:        'Failed to add event. Please try again.',
      updateError:     'Failed to update event. Please try again.',
      deleteError:     'Failed to delete event. Please try again.',
      deleteConfirm:   'Are you sure you want to delete this event?',
      form: {
        editTitle:  'Edit Event',
        addTitle:   'Add New Event',
        titleField: 'Event Title',
        date:       'Date',
        location:   'Location',
        organizer:  'Organizer',
        websiteUrl: 'Website URL',
        isPublic:   'Public Event (visible on timeline)',
        update:     'Update',
        add:        'Add',
        cancel:     'Cancel',
      },
      table: {
        date:     'Date',
        title:    'Title',
        location: 'Location',
        status:   'Status',
        actions:  'Actions',
        public:   'Public',
        private:  'Private',
        edit:     'Edit',
        delete:   'Delete',
      },
    },

    // ── Founding members page ─────────────────────────────
    founders: {
      pageTitle: 'Founding Members',
    },

    // ── Members section ───────────────────────────────────
    members: {
      pageTitle:    'Network Members',
      views: {
        members:    'Members',
        admin:      'Admin View',
        governance: 'Governance',
      },
    },

    // ── Forum section ─────────────────────────────────────
    forum: {
      pageTitle:        'Community Projects',
      newProject:       'New Project',
      backToList:       'Back to list',
      noProjects:       'No projects found',
      loadError:        'Failed to load projects. Please try again later.',
      deleteError:      'Failed to delete project. Please try again.',
      filter: {
        all:        'All Projects',
        draft:      'Draft',
        published:  'Published',
        inProgress: 'In Progress',
        completed:  'Completed',
      },
      card: {
        budget:         'Budget:',
        requiredSkills: 'Required Skills:',
        createdBy:      'Created by:',
      },
    },

    // ── Guide / WalkThrough ───────────────────────────────
    guide: {
      appName:  'I4TK Knowledge Network',
      subtitle: 'User Guide',
      tabs: {
        observer:  'Observer',
        member:    'Member',
        validator: 'Validator',
        admin:     'Administrator',
      },

      // Observer tab
      observer: {
        intro: 'As an Observer, you have full access to the I4TK knowledge base and research tools.',
        library: {
          title: 'Document Library',
          browse: {
            title: 'Browse & Search',
            desc:  'Access all published documents. Filter by category, programme, or geographic area. Full metadata visible for every document.',
          },
          citation: {
            title:   'Citation Network',
            desc:    'Click any document to explore its citation tree — see which documents it references and which cite it in return.',
            green:   'Green = citing this doc',
            gray:    'Gray = referenced by it',
          },
        },
        ai: {
          title:    'AI Research Assistant',
          desc:     'Ask questions in English or French and get answers drawn directly from the library documents, with citations.',
          example:  '"What are the main AI regulations in Europe?"',
          howItWorks: 'The assistant searches the library semantically and returns a synthesised answer with links to the source documents.',
        },
        periodicTable: {
          title:   'Periodic Table of Platform Regulation',
          desc:    'Explore 54 regulatory elements organised across 6 thematic categories. Click any element to read its definition and see which library documents cover it.',
          categories: {
            institutionalFramework: 'Institutional Framework',
            legislatingPlatforms:   'Legislating Platforms',
            humanRights:            'Human Rights',
            contentGovernance:      'Content Governance',
            systemicRisks:          'Systemic Risks',
            prosocialDesign:        'Pro-social Design',
          },
        },
        pathways: {
          title: 'Regulation Pathways',
          desc:  'Browse all regulation pathways created by network members. Each pathway combines several periodic table elements into a coherent regulatory approach. You can view the elements chosen, read author justifications for each step, and rate pathways with stars.',
        },
        joinCta: {
          title: 'Join as a full Member',
          desc:  'To contribute to the network — submit documents, participate in peer review, access the community forum, or create your own regulation pathways — contact the I4TK team to request full membership:',
        },
      },

      // Member tab
      member: {
        intro: 'As a member, you have access to the document library, AI assistant, community, and research tools.',
        library: {
          title: 'Document Library',
          browse: {
            title: 'Browse Documents',
            desc:  'View all published documents with full metadata. Filter by category (Research Paper, Guideline, Policy Brief…) or search by title and content.',
          },
          citation: {
            title: 'Citation Tree',
            desc:  'Click any document to see its citation network.',
            green: 'Green = citing this document',
            gray:  'Gray = referenced by this document',
          },
        },
        ai: {
          title:      'RAG AI Assistant',
          desc:       'Ask questions in English or French and get answers based on library documents.',
          example:    '"What are the main AI regulations in Europe?"',
          howItWorks: 'The assistant searches the library and provides citations to relevant documents.',
        },
        periodicTable: {
          title: 'Periodic Table of Regulation',
          desc:  'A unique visualization with 54 regulatory elements in 6 categories:',
          click: 'Click any element to view its description and linked documents.',
        },
        pathways: {
          title: 'Regulation Pathways',
          desc:  'Create custom regulatory pathways by combining multiple periodic table elements. Visualize complete regulatory approaches and share them with collaborators.',
        },
      },

      // Validator tab
      validator: {
        intro: 'Validators can submit documents to the library and participate in the peer validation process. Two submission paths are available.',
        submit: {
          title:     'Submit a Document',
          chooseMsg: 'When you click "Submit Contribution", you choose between two paths:',
          pathA: {
            title:       'Path A — Admin Validation',
            badge:       'No wallet needed',
            desc:        'The document is submitted for review by an I4TK administrator. Once approved, an admin publishes it.',
            step1title:  'Upload PDF',
            step1desc:   'Drag and drop your document — it is stored on IPFS via Pinata.',
            step2title:  'Fill Metadata',
            step2desc:   'Title, authors, programme, categories, geographic area, references.',
            step3title:  'AI Auto-Tagging (optional)',
            step3desc:   'Click "Suggest Tags with AI" to identify periodic table elements.',
            step4title:  'Submit for Admin Validation',
            step4desc:   'Your document enters the admin review queue with status Pending.',
            step5title:  'Admin Review',
            step5desc:   'An admin approves (publishes) or rejects (with reason) your document.',
          },
          pathB: {
            title:       'Path B — Peer Review',
            badge:       'Recommended',
            badgeWallet: 'Requires wallet',
            desc:        'The document is recorded on the blockchain and submitted for review by 4 independent validators.',
            step1title:  'Upload PDF',
            step1desc:   'Drag and drop your document — stored on IPFS via Pinata.',
            step2title:  'Fill Metadata',
            step2desc:   'Title, authors, programme, categories, geographic area, references.',
            step3title:  'AI Auto-Tagging (optional)',
            step3desc:   'Click "Suggest Tags with AI" — GPT-4o-mini analysis with confidence scores.',
            step4title:  'Connect Wallet & Submit',
            step4desc:   'Confirm the transaction in MetaMask — ERC1155 token minted on Sepolia.',
            step5title:  'Peer Review (4 validations)',
            step5desc:   '4 validators must approve before publication. Each vote is on-chain.',
            aiTitle:     'AI Auto-Tagging details:',
            aiStep1:     'PDF text extracted from IPFS server-side',
            aiStep2:     'Semantic pre-selection with TensorFlow.js',
            aiStep3:     'GPT-4o-mini validation with confidence scores',
            highConf:    '80%+ High confidence',
            medConf:     '60–79% Medium',
          },
        },
        validate: {
          title:          'Validate Documents (Peer Review)',
          desc:           'Go to Network Publications to see documents pending peer validation. Connect your wallet and click Validate on any document you have reviewed.',
          progressTitle:  'Validation progress',
          progressOf:     'validations',
          progressNote:   '4 validations required. Each validation is recorded immutably on-chain. You cannot validate a document you have already validated.',
        },
        tokens: {
          title:      'Token Distribution',
          desc:       'When a document is published via peer review, 100 million I4TK tokens are distributed:',
          creator:    'Creator',
          referenced: 'Referenced documents (recursive)',
          note:       'This creates a token-based incentive aligned with knowledge production — not speculation.',
        },
        wallet: {
          title:    "Don't have a wallet?",
          desc:     'A wallet is only required for the Peer Review path. You can always use Admin Validation without one. To use Peer Review, install MetaMask and send your wallet address to the I4TK team to be granted on-chain rights.',
          download: 'Download MetaMask →',
          contact:  'Then contact:',
        },
      },

      // Admin tab
      admin: {
        intro: 'Administrators have full control over users, document validation, blockchain roles, and data export.',
        users: {
          title: 'User Management',
          item1: 'View all users with their roles (Observer, Member, Validator, Admin)',
          item2: 'Promote Members to Validators (or downgrade)',
          item3: 'Synchronize roles with the blockchain',
          item4: 'Send email invitations to new members',
        },
        validation: {
          title: 'Admin Validation Queue',
          desc:  'Review documents submitted for admin validation. Approve to publish immediately, reject with a reason, or transfer to peer review.',
        },
        blockchain: {
          title: 'Blockchain Role Registration',
          desc:  'Register new validators on the smart contract (I4TKnetwork on Sepolia). After on-chain confirmation, the role is saved in Firestore.',
        },
        export: {
          title: 'Data Export',
          desc:  'Export the library heatmap as CSV to analyse which regulatory elements are covered across the document collection.',
        },
      },
    }, // end guide

    // ── Library page ──────────────────────────────────────
    library: {
      pageTitle:      'I4T Knowledge Library',
      searchPlaceholder: 'Search documents…',
      loginPrompt:    'Login as a member to access peer-review features',
      myContributions: 'My contributions to the I4TK community',
      tabs: {
        peerReviews:        'Peer reviews',
        submitContribution: 'Submit Contribution',
        librarianSpace:     'Librarian Space',
        ipMonitoring:       'IP monitoring',
      },
    },

    // ── Library AI Chat ───────────────────────────────────
    chat: {
      suggestedQuestions: 'Suggested Questions',
      placeholder:        'Ask about our research documents…',
      send:               'Send',
      sources:            'Sources:',
      error:              'An error occurred. Please try again.',
      prompts: [
        'What is the I4TK Network?',
        'What are the UNESCO guidelines?',
        'What are the priorities for regulating platforms?',
        "What is Trump's election impact on digital platforms governance?",
      ],
    },

    // ── Tools / Periodic Table ────────────────────────────
    tools: {
      pageTitle:      'Tools',
      searchPlaceholder: 'Search for an element…',
      exportCsv:      'Export CSV',
      exporting:      'Exporting…',
      zoomIn:         'Zoom In',
      zoomOut:        'Zoom Out',
      resetView:      'Reset View',
      selectAll:      'Select All',
      deselectAll:    'Deselect All',
      editMode:       'Edit',
      cancelEdit:     'Cancel',
      showingFrom:    'Showing documents and examples from:',
      noGeography:    'None',
      loadError:      'Failed to load toolkit elements. Please try again later.',
      updateError:    'Failed to update element. Please try again.',
      addExError:     'Failed to add example. Please try again.',
      delExError:     'Failed to delete example. Please try again.',
      exportFailed:   'Export failed:',
      scrollHint:     'Scroll horizontally to explore all elements',
      zoomPanHint:    'Scroll to zoom · Hold Alt + drag to pan',
      categories: {
        institutionalFramework: 'Institutional framework',
        legislatingPlatforms:   'Legislating platforms',
        humanRights:            'Human Rights and Rule of Law',
        contentGovernance:      'Content governance',
        systemicRisks:          'Systemic risks + due diligence',
        prosocialDesign:        'Pro-social design',
      },
      geographies: ['EUROPE', 'MIDDLE EAST', 'AFRICA', 'LATAM', 'ASIA', 'OCEANIA', 'NORTH AMERICA'],
      csv: {
        headers: ['Category', 'Name', 'Symbol', 'Description', 'Context', 'Application Examples', 'Related Documents'],
      },
      exampleForm: {
        titleLabel:       'Title',
        titlePlaceholder: 'Brief title for your example',
        descLabel:        'Description',
        descPlaceholder:  'Describe a real-world application example…',
        refLabel:         'Reference URL (optional)',
      },
      unknownElement:           'Unknown element',
      searchElementPlaceholder: 'Search element to add…',
      noElementFound:           'No element found',
      searchHint:               'Type to search and add elements to the pathway.',
      justification:            'Justification',
    },

    // ── Admin View (Members section) ──────────────────────
    adminView: {
      tabs: {
        organizations: 'Organizations',
        users:         'Users',
        invitations:   'Invitations',
      },
      addOrganization: 'Add Organization',
      inviteUser:      'Invite User',
      deleteOrgConfirm:  'Are you sure you want to delete this organization?',
      deleteUserConfirm: 'Are you sure you want to delete this user?',
      cancelInvConfirm:  'Are you sure you want to cancel this invitation?',
      resendInvConfirm:  'Are you sure you want to resend this invitation?',
      invitationResent:  'Invitation resent successfully',
      invitationSent:    'Invitation sent successfully',
      resendError:       'Error resending invitation',
      expiresPrefix:     'Expires',
      expiresToday:      'Expires today',
      expiresTomorrow:   'Expires tomorrow',
      editOrg:           'Edit organization',
      deleteOrg:         'Delete organization',
      resendInv:         'Resend invitation',
      cancelInv:         'Cancel invitation',
      deleteUser:        'Delete user',
      unknownOrg:        'Unknown',
      orgTypes: {
        academic:     'Academic',
        civilSociety: 'Civil society',
        thinkTank:    'Think tank',
      },
      regions: {
        europe:       'Europe',
        asiaPacific:  'Asia-Pacific',
        northAmerica: 'North America',
        southAmerica: 'South America',
        africa:       'Africa',
        middleEast:   'Middle East',
      },
    },

    // ── Password reset (ForgotPassword) ───────────────────
    forgotPassword: {
      title:            'Reset Your Password',
      emailLabel:       'Email Address',
      emailPlaceholder: 'Enter your email address',
      submitButton:     'Send Instructions',
      processing:       'Processing…',
      verifyTitle:      'Verify Code',
      verifyPrompt:     'Please enter the reset code received by email.',
      codeLabel:        'Reset Code',
      codePlaceholder:  'Enter the code received by email',
      verifyButton:     'Verify Code',
      backToLogin:      'Back to Login',
      passwordTitle:    'Set New Password',
      passwordPrompt:   'Please enter your new password below.',
      resetButton:      'Reset Password',
      successMessage:   'If an account exists with this email address, you will receive instructions to reset your password.',
      checkInbox:       'Please check your inbox and spam folder.',
      codeRequired:     'Please enter the reset code',
      invalidCode:      'Invalid reset code',
      missingData:      'Missing reset data',
      resetSuccess:     'Your password has been reset successfully',
      resetAndLoggedIn: 'Your password has been reset and you are now logged in',
      generalError:     'An error occurred while resetting your password.',
      linkInvalid:      'The reset link is invalid or has expired.',
      checkError:       'An error occurred while checking the reset link.',
      redirectingHome:  'Redirecting to homepage…',
    },

    // ── Press Releases page ───────────────────────────────
    pressRelease: {
      loadError:    'Error loading press releases: ',
      loading:      'Loading press releases…',
      noResults:    'No press releases found.',
    },

    // ── Terms of Reference page ───────────────────────────
    tor: {
      loadError: 'Error loading Terms of reference: ',
      loading:   'Loading Terms of reference…',
      noResults: 'No Terms of reference found.',
    },

    // ── Citation Tree / Genealogy ─────────────────────────
    genealogy: {
      pageTitle:        'Citation Tree',
      backToLibrary:    'Back to Library',
      loadError:        'Error loading genealogy: ',
      tokenIdMissing:   'Token ID not provided',
      documentNotFound: 'Document not found',
      loading:          'Loading citation tree…',
      legend: {
        descendants: 'Descendants',
        mainDoc:     'Main Doc',
        references:  'References',
      },
      panel: {
        title:       'Document Details',
        author:      'Author',
        description: 'Description',
        citations:   'Citations',
        refPrefix:   'Reference #',
        noCitations: 'No citations',
        clickPrompt: 'Click on a document to view details',
      },
    },

    // ── Document Metadata Editor ──────────────────────────
    metadata: {
      modalTitle:      'Edit Document Metadata',
      fields: {
        title:        'Title',
        authors:      'Authors',
        description:  'Description',
        programme:    'Programme',
        collection:   'Collection',
        categories:   'Categories',
        geoScope:     'Geographic Scope',
        references:   'Bibliographic references',
        elements:     'Periodic Table Elements',
      },
      placeholders: {
        authors:       'Enter authors separated by commas',
        programme:     'Select a programme',
        collection:    'Select a collection (optional)',
        references:    'Enter reference IDs separated by commas',
        searchElements: 'Search elements…',
      },
      hints: {
        geoDefault:    'All regions selected by default. Uncheck regions where this document does not apply.',
        elementTag:    'Tag this document with relevant elements from the Periodic Table of Platform Regulation',
        aiAnalysis:    'AI analyzed your document using semantic embeddings and GPT-4o-mini',
      },
      ai: {
        suggestButton:  'AI Suggest Tags',
        analyzing:      'Analyzing…',
        suggestions:    'AI Tag Suggestions',
        applyAll:       'Apply All',
        dismiss:        'Dismiss',
        apply:          'Apply',
        errorTitle:     'AI Suggestion Error',
        noMatches:      'No tag suggestions found. The AI couldn\'t find strong matches for this document.',
        confident:      '% confident',
      },
      selectedPrefix:  'Selected elements',
      noElements:      'No elements found',
      loadElemError:   'Failed to load periodic table elements',
      saveError:       'Failed to save document: ',
      cancel:          'Cancel',
      save:            'Save Changes',
      saving:          'Saving…',
    },

    // ── IP Dashboard (My contributions tab) ───────────────
    ipDashboard: {
      communityStats:   'Community statistics',
      networkIPValue:   'Network total IP value:',
      myIP:             'My intellectual property in i4t tokens',
      noDocuments:      'No documents found for this address',
      tokenLabel:       'Token #',
    },

    // ── Finalize Invitation (account creation flow) ───────
    finalizeInvitation: {
      password:                  'Password',
      passwordMinLength:         '8 characters minimum',
      confirmPassword:           'Confirm password',
      confirmPasswordPlaceholder:'Enter your password again',
      completeRegistration:      'Complete registration',
      invitationInvalid:         'Invalid invitation',
      invitationNotFound:        'Invitation not found. Please validate your invitation first.',
      invitationDataMissing:     'Invitation data missing',
      loading:                   'Loading…',
      processing:                'Processing…',
      error:                     'Error',
      backToHome:                'Back to home',
      registrationSuccess:       'Registration successful!',
      termsOfReference:          'Terms of Reference',
      viewFullDocument:          'View full document',
      continue:                  'Continue',
      createPassword:            'Create a password',
      invalidCode:               'Invalid invitation code',
      torAcceptRequired:         'You must accept the Terms of Reference to continue',
      passwordsNoMatch:          'Passwords do not match',
      passwordMinChars:          'Password must be at least 8 characters',
      accountCreated:            'Your account has been created successfully!',
      accountCreatedRedirect:    'Your account has been created successfully. You will be redirected to the home page.',
      torCheckboxLabel:          'I have read and accept the Terms of Reference',
      finalStep:                 'Final step! Please create a secure password for your account.',
    },

    // ── Invitation Validator ───────────────────────────────
    invitationValidator: {
      validating:       'Validating…',
      redirecting:      'Redirecting…',
      error:            'Error',
      tryAgain:         'Try again',
      title:            'Validate your invitation',
      emailLabel:       'Email address',
      codeLabel:        'Invitation code',
      validateButton:   'Validate invitation',
      enterEmailAndCode:'Enter the email and invitation code you received',
      validationSuccess:'Invitation code successfully validated!',
      validationError:  'An error occurred while validating the invitation code',
      codeValidated:    'Your code has been validated. You will be redirected to the next step.',
    },

    // ── ToR Acceptance Required ────────────────────────────
    torAcceptance: {
      termsAccepted:       'Terms accepted. Welcome!',
      loading:             'Loading…',
      termsAcceptedTitle:  'Terms accepted!',
      redirecting:         'Redirecting…',
      termsRequired:       'Terms of Reference Required',
      viewFullDocument:    'View full document',
      processing:          'Processing…',
      continue:            'Continue',
      torDocumentNotFound: 'Terms of Reference document not found',
      roleUpdated:         'Your role has been updated. You must accept the Terms of Reference to continue.',
      torAcceptRequired:   'You must accept the Terms of Reference to continue',
      torCheckboxLabel:    'I have read and accept the Terms of Reference',
    },

  }, // end en


  // ════════════════════════════════════════════════════════
  // SPANISH
  // ════════════════════════════════════════════════════════
  es: {

    common: {
      cancel:       'Cancelar',
      save:         'Guardar',
      edit:         'Editar',
      delete:       'Eliminar',
      add:          'Añadir',
      update:       'Actualizar',
      confirm:      'Confirmar',
      close:        'Cerrar',
      loading:      'Cargando…',
      error:        'Error',
      success:      'Éxito',
      yes:          'Sí',
      no:           'No',
      by:           'Por:',
      moreInfo:     'Más información',
      noData:       'No hay datos disponibles',
      required:     'Obligatorio',
      optional:     'Opcional',
      search:       'Buscar',
      filter:       'Filtrar',
      all:          'Todo',
      back:         'Volver',
      next:         'Siguiente',
      submit:       'Enviar',
      send:         'Enviar',
    },

    header: {
      tagline:        'Red global de conocimiento para un Internet de Confianza',
      login:          'Iniciar sesión',
      cancel:         'Cancelar',
      menuAriaLabel:  'Menú principal',
      nav: {
        home:          'Inicio',
        about:         'Acerca de',
        members:       'Miembros',
        library:       'Biblioteca',
        pressReleases: 'Comunicados de prensa',
        forum:         'Foro',
        tools:         'Herramientas',
        guide:         'Guía',
        draft:         'Borrador',
      },
    },

    home: {
      stats: {
        members:          'miembros',
        southNorth:       'Sur / Norte',
        civilAcademic:    'Sociedad Civil / Académico',
        publishedDocs:    'Documentos publicados',
        activeProjects:   'Proyectos activos',
      },
      cta: {
        title:    '¡Únase a nuestra red hoy!',
        subtitle: 'Complete el formulario a continuación para formar parte de nuestra comunidad global de conocimiento',
      },
    },

    search: {
      title:        'Buscar por título, autor o contenido:',
      placeholder:  'Buscar en la base de conocimiento…',
      ariaLabel:    'Buscar',
      relevant:     'relevante',
      noResults:    'No se encontraron resultados',
      error:        'Error al realizar la búsqueda',
    },

    about: {
      tabs: {
        events:           'Eventos',
        founders:         'Miembros fundadores',
        tor:              'Términos de referencia',
        prai:             'Asociación PRAI',
        focusCentralAm:   'Enfoque en América Central',
      },
      mission: {
        knowledgeTitle:   'Productores de conocimiento de clase mundial',
        knowledgeDesc:    'Reuniendo a los principales centros de investigación y grupos de reflexión',
        collectiveTitle:  'Acción colectiva',
        collectiveDesc:   'Fomentando la colaboración para una mejor gobernanza digital',
        independentTitle: 'Red independiente',
        independentDesc:  'Manteniendo la autonomía en la investigación y las recomendaciones',
        outputTitle:      'Orientado a resultados',
        outputDesc:       'Enfocado en producir análisis y soluciones aplicables',
      },
      contact: {
        label: 'Contáctenos en',
      },
    },

    unesco: {
      title:      'La regulación de las plataformas digitales en México, América Central y el Caribe',
      openNewTab: 'Abrir en nueva pestaña',
    },

    events: {
      sectionTitle:     'Nuestro recorrido e hitos',
      manageEvents:     'Gestionar eventos',
      viewTimeline:     'Ver cronología',
      addProject:       'Añadir proyecto',
      addNewEvent:      'Añadir nuevo evento',
      communityProject: 'Proyecto comunitario',
      loginRequired:    'Inicio de sesión requerido',
      moreInfo:         'Más información',
      dateUndefined:    'Fecha no definida',
      noEvents:         'No se encontraron eventos. Añada el primero con el botón de arriba.',
      loadError:        'Error al cargar los eventos. Inténtelo de nuevo.',
      addError:         'Error al añadir el evento. Inténtelo de nuevo.',
      updateError:      'Error al actualizar el evento. Inténtelo de nuevo.',
      deleteError:      'Error al eliminar el evento. Inténtelo de nuevo.',
      deleteConfirm:    '¿Está seguro de que desea eliminar este evento?',
      form: {
        editTitle:  'Editar evento',
        addTitle:   'Añadir nuevo evento',
        titleField: 'Título del evento',
        date:       'Fecha',
        location:   'Ubicación',
        organizer:  'Organizador',
        websiteUrl: 'URL del sitio web',
        isPublic:   'Evento público (visible en la cronología)',
        update:     'Actualizar',
        add:        'Añadir',
        cancel:     'Cancelar',
      },
      table: {
        date:     'Fecha',
        title:    'Título',
        location: 'Ubicación',
        status:   'Estado',
        actions:  'Acciones',
        public:   'Público',
        private:  'Privado',
        edit:     'Editar',
        delete:   'Eliminar',
      },
    },

    founders: {
      pageTitle: 'Miembros fundadores',
    },

    members: {
      pageTitle: 'Miembros de la red',
      views: {
        members:    'Miembros',
        admin:      'Vista de administración',
        governance: 'Gobernanza',
      },
    },

    forum: {
      pageTitle:   'Proyectos comunitarios',
      newProject:  'Nuevo proyecto',
      backToList:  'Volver a la lista',
      noProjects:  'No se encontraron proyectos',
      loadError:   'Error al cargar los proyectos. Inténtelo más tarde.',
      deleteError: 'Error al eliminar el proyecto. Inténtelo de nuevo.',
      filter: {
        all:        'Todos los proyectos',
        draft:      'Borrador',
        published:  'Publicado',
        inProgress: 'En progreso',
        completed:  'Completado',
      },
      card: {
        budget:         'Presupuesto:',
        requiredSkills: 'Habilidades requeridas:',
        createdBy:      'Creado por:',
      },
    },

    guide: {
      appName:  'Red de Conocimiento I4TK',
      subtitle: 'Guía del usuario',
      tabs: {
        observer:  'Observador',
        member:    'Miembro',
        validator: 'Validador',
        admin:     'Administrador',
      },

      observer: {
        intro: 'Como Observador, tiene acceso completo a la base de conocimiento y a las herramientas de investigación de I4TK.',
        library: {
          title: 'Biblioteca de documentos',
          browse: {
            title: 'Explorar y buscar',
            desc:  'Acceda a todos los documentos publicados. Filtre por categoría, programa o área geográfica. Metadatos completos visibles para cada documento.',
          },
          citation: {
            title:   'Red de citas',
            desc:    'Haga clic en cualquier documento para explorar su árbol de citas — vea qué documentos referencia y cuáles lo citan a su vez.',
            green:   'Verde = cita este documento',
            gray:    'Gris = referenciado por él',
          },
        },
        ai: {
          title:      'Asistente de investigación IA',
          desc:       'Haga preguntas en inglés o francés y obtenga respuestas extraídas directamente de los documentos de la biblioteca, con citas.',
          example:    '"¿Cuáles son las principales regulaciones de IA en Europa?"',
          howItWorks: 'El asistente busca semánticamente en la biblioteca y devuelve una respuesta sintetizada con enlaces a los documentos fuente.',
        },
        periodicTable: {
          title:   'Tabla periódica de la regulación de plataformas',
          desc:    'Explore 54 elementos regulatorios organizados en 6 categorías temáticas. Haga clic en cualquier elemento para leer su definición y ver qué documentos de la biblioteca lo cubren.',
          categories: {
            institutionalFramework: 'Marco institucional',
            legislatingPlatforms:   'Legislación de plataformas',
            humanRights:            'Derechos humanos',
            contentGovernance:      'Gobernanza de contenidos',
            systemicRisks:          'Riesgos sistémicos',
            prosocialDesign:        'Diseño pro-social',
          },
        },
        pathways: {
          title: 'Itinerarios de regulación',
          desc:  'Explore todos los itinerarios de regulación creados por los miembros de la red. Cada itinerario combina varios elementos de la tabla periódica en un enfoque regulatorio coherente. Puede ver los elementos elegidos, leer las justificaciones del autor para cada paso y valorar los itinerarios con estrellas.',
        },
        joinCta: {
          title: 'Únase como miembro de pleno derecho',
          desc:  'Para contribuir a la red — enviar documentos, participar en la revisión por pares, acceder al foro comunitario o crear sus propios itinerarios de regulación — contacte al equipo I4TK para solicitar la membresía completa:',
        },
      },

      member: {
        intro: 'Como miembro, tiene acceso a la biblioteca de documentos, el asistente de IA, la comunidad y las herramientas de investigación.',
        library: {
          title: 'Biblioteca de documentos',
          browse: {
            title: 'Explorar documentos',
            desc:  'Vea todos los documentos publicados con metadatos completos. Filtre por categoría (Artículo de investigación, Directriz, Nota de política…) o busque por título y contenido.',
          },
          citation: {
            title: 'Árbol de citas',
            desc:  'Haga clic en cualquier documento para ver su red de citas.',
            green: 'Verde = cita este documento',
            gray:  'Gris = referenciado por este documento',
          },
        },
        ai: {
          title:      'Asistente IA RAG',
          desc:       'Haga preguntas en inglés o francés y obtenga respuestas basadas en los documentos de la biblioteca.',
          example:    '"¿Cuáles son las principales regulaciones de IA en Europa?"',
          howItWorks: 'El asistente busca en la biblioteca y proporciona citas de los documentos relevantes.',
        },
        periodicTable: {
          title: 'Tabla periódica de la regulación',
          desc:  'Una visualización única con 54 elementos regulatorios en 6 categorías:',
          click: 'Haga clic en cualquier elemento para ver su descripción y los documentos vinculados.',
        },
        pathways: {
          title: 'Itinerarios de regulación',
          desc:  'Cree itinerarios regulatorios personalizados combinando múltiples elementos de la tabla periódica. Visualice enfoques regulatorios completos y compártalos con colaboradores.',
        },
      },

      validator: {
        intro: 'Los validadores pueden enviar documentos a la biblioteca y participar en el proceso de validación por pares. Hay dos vías de envío disponibles.',
        submit: {
          title:     'Enviar un documento',
          chooseMsg: 'Al hacer clic en "Enviar contribución", elija entre dos vías:',
          pathA: {
            title:       'Vía A — Validación por administrador',
            badge:       'Sin billetera requerida',
            desc:        'El documento se envía para revisión por un administrador de I4TK. Una vez aprobado, un administrador lo publica.',
            step1title:  'Cargar PDF',
            step1desc:   'Arrastre y suelte su documento — se almacena en IPFS a través de Pinata.',
            step2title:  'Completar metadatos',
            step2desc:   'Título, autores, programa, categorías, área geográfica, referencias.',
            step3title:  'Etiquetado automático con IA (opcional)',
            step3desc:   'Haga clic en "Sugerir etiquetas con IA" para identificar elementos de la tabla periódica.',
            step4title:  'Enviar para validación por administrador',
            step4desc:   'Su documento entra en la cola de revisión del administrador con estado Pendiente.',
            step5title:  'Revisión por el administrador',
            step5desc:   'Un administrador aprueba (publica) o rechaza (con motivo) su documento.',
          },
          pathB: {
            title:       'Vía B — Revisión por pares',
            badge:       'Recomendada',
            badgeWallet: 'Requiere billetera',
            desc:        'El documento se registra en la cadena de bloques y se somete a revisión por 4 validadores independientes.',
            step1title:  'Cargar PDF',
            step1desc:   'Arrastre y suelte su documento — almacenado en IPFS a través de Pinata.',
            step2title:  'Completar metadatos',
            step2desc:   'Título, autores, programa, categorías, área geográfica, referencias.',
            step3title:  'Etiquetado automático con IA (opcional)',
            step3desc:   'Haga clic en "Sugerir etiquetas con IA" — análisis GPT-4o-mini con puntuaciones de confianza.',
            step4title:  'Conectar billetera y enviar',
            step4desc:   'Confirme la transacción en MetaMask — token ERC1155 acuñado en Sepolia.',
            step5title:  'Revisión por pares (4 validaciones)',
            step5desc:   '4 validadores deben aprobar antes de la publicación. Cada voto es on-chain.',
            aiTitle:     'Detalles del etiquetado automático con IA:',
            aiStep1:     'Texto del PDF extraído desde IPFS en el servidor',
            aiStep2:     'Preselección semántica con TensorFlow.js',
            aiStep3:     'Validación con GPT-4o-mini y puntuaciones de confianza',
            highConf:    '80%+ Alta confianza',
            medConf:     '60–79% Media',
          },
        },
        validate: {
          title:          'Validar documentos (Revisión por pares)',
          desc:           'Vaya a Publicaciones de la red para ver los documentos pendientes de validación por pares. Conecte su billetera y haga clic en Validar en cualquier documento que haya revisado.',
          progressTitle:  'Progreso de validación',
          progressOf:     'validaciones',
          progressNote:   'Se requieren 4 validaciones. Cada validación se registra de forma inmutable on-chain. No puede validar un documento que ya haya validado.',
        },
        tokens: {
          title:      'Distribución de tokens',
          desc:       'Cuando un documento se publica mediante revisión por pares, se distribuyen 100 millones de tokens I4TK:',
          creator:    'Creador',
          referenced: 'Documentos referenciados (recursivo)',
          note:       'Esto crea un incentivo basado en tokens alineado con la producción de conocimiento — no con la especulación.',
        },
        wallet: {
          title:    '¿No tiene billetera?',
          desc:     'Una billetera solo es necesaria para la vía de Revisión por pares. Siempre puede utilizar la Validación por administrador sin una. Para usar la Revisión por pares, instale MetaMask y envíe su dirección de billetera al equipo I4TK para obtener los derechos on-chain.',
          download: 'Descargar MetaMask →',
          contact:  'Luego contacte a:',
        },
      },

      admin: {
        intro: 'Los administradores tienen control total sobre usuarios, validación de documentos, roles en la cadena de bloques y exportación de datos.',
        users: {
          title: 'Gestión de usuarios',
          item1: 'Ver todos los usuarios con sus roles (Observador, Miembro, Validador, Administrador)',
          item2: 'Promover Miembros a Validadores (o degradar)',
          item3: 'Sincronizar roles con la cadena de bloques',
          item4: 'Enviar invitaciones por correo electrónico a nuevos miembros',
        },
        validation: {
          title: 'Cola de validación de administrador',
          desc:  'Revise los documentos enviados para validación por administrador. Apruebe para publicar inmediatamente, rechace con un motivo o transfiera a revisión por pares.',
        },
        blockchain: {
          title: 'Registro de roles en la cadena de bloques',
          desc:  'Registre nuevos validadores en el contrato inteligente (I4TKnetwork en Sepolia). Tras la confirmación on-chain, el rol se guarda en Firestore.',
        },
        export: {
          title: 'Exportación de datos',
          desc:  'Exporte el mapa de calor de la biblioteca como CSV para analizar qué elementos regulatorios están cubiertos en la colección de documentos.',
        },
      },
    }, // end guide

    // ── Library page ──────────────────────────────────────
    library: {
      pageTitle:         'Biblioteca de conocimiento I4T',
      searchPlaceholder: 'Buscar documentos…',
      loginPrompt:       'Inicie sesión como miembro para acceder a las funciones de revisión por pares',
      myContributions:   'Mis contribuciones a la comunidad I4TK',
      tabs: {
        peerReviews:        'Revisiones por pares',
        submitContribution: 'Enviar contribución',
        librarianSpace:     'Espacio del bibliotecario',
        ipMonitoring:       'Seguimiento de IP',
      },
    },

    // ── Library AI Chat ───────────────────────────────────
    chat: {
      suggestedQuestions: 'Preguntas sugeridas',
      placeholder:        'Haga una pregunta sobre nuestros documentos de investigación…',
      send:               'Enviar',
      sources:            'Fuentes:',
      error:              'Se ha producido un error. Por favor, inténtelo de nuevo.',
      prompts: [
        '¿Qué es la Red I4TK?',
        '¿Cuáles son las directrices de la UNESCO?',
        '¿Cuáles son las prioridades para regular las plataformas?',
        '¿Cómo impacta la elección de Trump en la gobernanza de las plataformas digitales?',
      ],
    },

    // ── Tools / Periodic Table ────────────────────────────
    tools: {
      pageTitle:         'Herramientas',
      searchPlaceholder: 'Buscar un elemento…',
      exportCsv:         'Exportar CSV',
      exporting:         'Exportando…',
      zoomIn:            'Acercar',
      zoomOut:           'Alejar',
      resetView:         'Restablecer vista',
      selectAll:         'Seleccionar todo',
      deselectAll:       'Deseleccionar todo',
      editMode:          'Editar',
      cancelEdit:        'Cancelar',
      showingFrom:       'Mostrando documentos y ejemplos de:',
      noGeography:       'Ninguna',
      loadError:         'Error al cargar los elementos. Inténtelo de nuevo más tarde.',
      updateError:       'Error al actualizar el elemento. Inténtelo de nuevo.',
      addExError:        'Error al añadir el ejemplo. Inténtelo de nuevo.',
      delExError:        'Error al eliminar el ejemplo. Inténtelo de nuevo.',
      exportFailed:      'Error de exportación:',
      scrollHint:        'Desplace horizontalmente para explorar todos los elementos',
      zoomPanHint:       'Rueda para zoom · Alt + arrastrar para mover',
      categories: {
        institutionalFramework: 'Marco institucional',
        legislatingPlatforms:   'Legislación de plataformas',
        humanRights:            'Derechos humanos y Estado de derecho',
        contentGovernance:      'Gobernanza de contenidos',
        systemicRisks:          'Riesgos sistémicos + diligencia debida',
        prosocialDesign:        'Diseño pro-social',
      },
      geographies: ['EUROPA', 'ORIENTE MEDIO', 'ÁFRICA', 'LATAM', 'ASIA', 'OCEANÍA', 'NORTEAMÉRICA'],
      csv: {
        headers: ['Categoría', 'Nombre', 'Símbolo', 'Descripción', 'Contexto', 'Ejemplos de aplicación', 'Documentos relacionados'],
      },
      exampleForm: {
        titleLabel:       'Título',
        titlePlaceholder: 'Título breve para su ejemplo',
        descLabel:        'Descripción',
        descPlaceholder:  'Describa un ejemplo de aplicación en el mundo real…',
        refLabel:         'URL de referencia (opcional)',
      },
      unknownElement:           'Elemento desconocido',
      searchElementPlaceholder: 'Buscar elemento para añadir…',
      noElementFound:           'No se encontró ningún elemento',
      searchHint:               'Escriba para buscar y añadir elementos al recorrido.',
      justification:            'Justificación',
    },

    // ── Admin View (Members section) ──────────────────────
    adminView: {
      tabs: {
        organizations: 'Organizaciones',
        users:         'Usuarios',
        invitations:   'Invitaciones',
      },
      addOrganization:   'Añadir organización',
      inviteUser:        'Invitar usuario',
      deleteOrgConfirm:  '¿Está seguro de que desea eliminar esta organización?',
      deleteUserConfirm: '¿Está seguro de que desea eliminar este usuario?',
      cancelInvConfirm:  '¿Está seguro de que desea cancelar esta invitación?',
      resendInvConfirm:  '¿Está seguro de que desea reenviar esta invitación?',
      invitationResent:  'Invitación reenviada correctamente',
      invitationSent:    'Invitación enviada correctamente',
      resendError:       'Error al reenviar la invitación',
      expiresPrefix:     'Vence',
      expiresToday:      'Vence hoy',
      expiresTomorrow:   'Vence mañana',
      editOrg:           'Editar organización',
      deleteOrg:         'Eliminar organización',
      resendInv:         'Reenviar invitación',
      cancelInv:         'Cancelar invitación',
      deleteUser:        'Eliminar usuario',
      unknownOrg:        'Desconocida',
      orgTypes: {
        academic:     'Académico',
        civilSociety: 'Sociedad civil',
        thinkTank:    'Think tank',
      },
      regions: {
        europe:       'Europa',
        asiaPacific:  'Asia-Pacífico',
        northAmerica: 'América del Norte',
        southAmerica: 'América del Sur',
        africa:       'África',
        middleEast:   'Oriente Medio',
      },
    },

    // ── Password reset (ForgotPassword) ───────────────────
    forgotPassword: {
      title:            'Restablecer su contraseña',
      emailLabel:       'Dirección de correo electrónico',
      emailPlaceholder: 'Ingrese su dirección de correo electrónico',
      submitButton:     'Enviar instrucciones',
      processing:       'Procesando…',
      verifyTitle:      'Verificar código',
      verifyPrompt:     'Ingrese el código de restablecimiento recibido por correo electrónico.',
      codeLabel:        'Código de restablecimiento',
      codePlaceholder:  'Ingrese el código recibido por correo electrónico',
      verifyButton:     'Verificar código',
      backToLogin:      'Volver al inicio de sesión',
      passwordTitle:    'Establecer nueva contraseña',
      passwordPrompt:   'Ingrese su nueva contraseña a continuación.',
      resetButton:      'Restablecer contraseña',
      successMessage:   'Si existe una cuenta con esta dirección de correo electrónico, recibirá instrucciones para restablecer su contraseña.',
      checkInbox:       'Revise su bandeja de entrada y la carpeta de spam.',
      codeRequired:     'Ingrese el código de restablecimiento',
      invalidCode:      'Código de restablecimiento no válido',
      missingData:      'Faltan datos de restablecimiento',
      resetSuccess:     'Su contraseña se ha restablecido correctamente',
      resetAndLoggedIn: 'Su contraseña se ha restablecido y ahora ha iniciado sesión',
      generalError:     'Se ha producido un error al restablecer su contraseña.',
      linkInvalid:      'El enlace de restablecimiento no es válido o ha expirado.',
      checkError:       'Se ha producido un error al comprobar el enlace de restablecimiento.',
      redirectingHome:  'Redirigiendo a la página de inicio…',
    },

    // ── Press Releases page ───────────────────────────────
    pressRelease: {
      loadError: 'Error al cargar los comunicados de prensa: ',
      loading:   'Cargando comunicados de prensa…',
      noResults: 'No se encontraron comunicados de prensa.',
    },

    // ── Terms of Reference page ───────────────────────────
    tor: {
      loadError: 'Error al cargar los términos de referencia: ',
      loading:   'Cargando términos de referencia…',
      noResults: 'No se encontraron términos de referencia.',
    },

    // ── Citation Tree / Genealogy ─────────────────────────
    genealogy: {
      pageTitle:        'Árbol de citas',
      backToLibrary:    'Volver a la biblioteca',
      loadError:        'Error al cargar la genealogía: ',
      tokenIdMissing:   'Token ID no proporcionado',
      documentNotFound: 'Documento no encontrado',
      loading:          'Cargando árbol de citas…',
      legend: {
        descendants: 'Descendientes',
        mainDoc:     'Doc. principal',
        references:  'Referencias',
      },
      panel: {
        title:       'Detalles del documento',
        author:      'Autor',
        description: 'Descripción',
        citations:   'Citas',
        refPrefix:   'Referencia #',
        noCitations: 'Sin citas',
        clickPrompt: 'Haga clic en un documento para ver los detalles',
      },
    },

    // ── Document Metadata Editor ──────────────────────────
    metadata: {
      modalTitle:      'Editar metadatos del documento',
      fields: {
        title:        'Título',
        authors:      'Autores',
        description:  'Descripción',
        programme:    'Programa',
        collection:   'Colección',
        categories:   'Categorías',
        geoScope:     'Alcance geográfico',
        references:   'Referencias bibliográficas',
        elements:     'Elementos de la tabla periódica',
      },
      placeholders: {
        authors:        'Ingrese los autores separados por comas',
        programme:      'Seleccione un programa',
        collection:     'Seleccione una colección (opcional)',
        references:     'Ingrese los IDs de referencia separados por comas',
        searchElements: 'Buscar elementos…',
      },
      hints: {
        geoDefault:  'Todas las regiones seleccionadas por defecto. Desmarque las regiones donde este documento no aplica.',
        elementTag:  'Etiquete este documento con los elementos relevantes de la Tabla periódica de la regulación de plataformas',
        aiAnalysis:  'La IA analizó su documento utilizando embeddings semánticos y GPT-4o-mini',
      },
      ai: {
        suggestButton:  'Sugerir etiquetas con IA',
        analyzing:      'Analizando…',
        suggestions:    'Sugerencias de etiquetas de IA',
        applyAll:       'Aplicar todo',
        dismiss:        'Descartar',
        apply:          'Aplicar',
        errorTitle:     'Error de sugerencia IA',
        noMatches:      'No se encontraron sugerencias. La IA no encontró coincidencias sólidas para este documento.',
        confident:      '% de confianza',
      },
      selectedPrefix:  'Elementos seleccionados',
      noElements:      'No se encontraron elementos',
      loadElemError:   'Error al cargar los elementos de la tabla periódica',
      saveError:       'Error al guardar el documento: ',
      cancel:          'Cancelar',
      save:            'Guardar cambios',
      saving:          'Guardando…',
    },

    // ── IP Dashboard (My contributions tab) ───────────────
    ipDashboard: {
      communityStats:   'Estadísticas de la comunidad',
      networkIPValue:   'Valor total de PI de la red:',
      myIP:             'Mi propiedad intelectual en tokens i4t',
      noDocuments:      'No se encontraron documentos para esta dirección',
      tokenLabel:       'Token #',
    },

    // ── Finalize Invitation (account creation flow) ───────
    finalizeInvitation: {
      password:                  'Contraseña',
      passwordMinLength:         'Mínimo 8 caracteres',
      confirmPassword:           'Confirmar contraseña',
      confirmPasswordPlaceholder:'Ingrese su contraseña nuevamente',
      completeRegistration:      'Finalizar registro',
      invitationInvalid:         'Invitación inválida',
      invitationNotFound:        'Invitación no encontrada. Primero valide su invitación.',
      invitationDataMissing:     'Datos de invitación faltantes',
      loading:                   'Cargando…',
      processing:                'Procesando…',
      error:                     'Error',
      backToHome:                'Volver al inicio',
      registrationSuccess:       '¡Registro exitoso!',
      termsOfReference:          'Condiciones de uso',
      viewFullDocument:          'Ver documento completo',
      continue:                  'Continuar',
      createPassword:            'Crear contraseña',
      invalidCode:               'Código de invitación inválido',
      torAcceptRequired:         'Debe aceptar las condiciones de uso para continuar',
      passwordsNoMatch:          'Las contraseñas no coinciden',
      passwordMinChars:          'La contraseña debe tener al menos 8 caracteres',
      accountCreated:            '¡Su cuenta ha sido creada con éxito!',
      accountCreatedRedirect:    'Su cuenta ha sido creada con éxito. Será redirigido a la página de inicio.',
      torCheckboxLabel:          'He leído y acepto las condiciones de uso',
      finalStep:                 '¡Último paso! Cree una contraseña segura para su cuenta.',
    },

    // ── Invitation Validator ───────────────────────────────
    invitationValidator: {
      validating:       'Validando…',
      redirecting:      'Redirigiendo…',
      error:            'Error',
      tryAgain:         'Intentar de nuevo',
      title:            'Validar su invitación',
      emailLabel:       'Dirección de correo electrónico',
      codeLabel:        'Código de invitación',
      validateButton:   'Validar invitación',
      enterEmailAndCode:'Ingrese el correo y el código de invitación recibidos',
      validationSuccess:'¡Código de invitación validado correctamente!',
      validationError:  'Ocurrió un error al validar el código de invitación',
      codeValidated:    'Su código ha sido validado. Será redirigido al siguiente paso.',
    },

    // ── ToR Acceptance Required ────────────────────────────
    torAcceptance: {
      termsAccepted:       'Condiciones aceptadas. ¡Bienvenido!',
      loading:             'Cargando…',
      termsAcceptedTitle:  '¡Condiciones aceptadas!',
      redirecting:         'Redirigiendo…',
      termsRequired:       'Condiciones de uso requeridas',
      viewFullDocument:    'Ver documento completo',
      processing:          'Procesando…',
      continue:            'Continuar',
      torDocumentNotFound: 'Documento de condiciones de uso no encontrado',
      roleUpdated:         'Su rol ha sido actualizado. Debe aceptar las condiciones de uso para continuar.',
      torAcceptRequired:   'Debe aceptar las condiciones de uso para continuar',
      torCheckboxLabel:    'He leído y acepto las condiciones de uso',
    },

  }, // end es

}; // end ui

export default ui;
