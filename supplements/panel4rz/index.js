      // ════════════════════════════════════════════
      // CONFIG — SUPABASE_URL / SUPABASE_ANON_KEY set by supabase-client.js
      // ════════════════════════════════════════════
      const SUPABASE_URL = window.SUPABASE_URL;
      const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY;
      const sb = window.supabase;
      const CLOUDINARY_CLOUD = "gcjqhpfk";
      const CLOUDINARY_PRESET = "maison confort";

      // ════════════════════════════════════════════
      // AUTH GUARD — redirect to login if not authenticated
      // ════════════════════════════════════════════
      if (sessionStorage.getItem("bb_admin_auth") !== "1") {
        window.location.href = "/mgmt9kx";
      }

      // ── STATE ──
      let adminLang = localStorage.getItem("admin_lang") || "fr";
      let sidebarCollapsed = false;
      let editingProductId = null;
      let editingDeliveryId = null;
      let editingCatId = null;
      let editingSubCatId = null;
      let editingSubSubCatId = null;
      let editingOrderId = null;
      let editingOrderItems = [];
      let _editAddProductId = null;
      let currentImageUrls = [];
      let currentCatImageUrl = "";
      let categories = [],
        subCategories = [],
        subSubCategories = [],
        products = [],
        deliveryPrices = [],
        orders = [],
        settings = {};
      let ordersTotal = 0, productsTotal = 0;
      let _dashOrders = [];
      const _PAGE = 15;
      let productPage = 1, catPage = 1, deliveryPage = 1, orderPage = 1;
      let _prodFilter = "", _delFilter = "";
      // ── Language helpers ──
      function _pLang(item) {
        if (!item) return "";
        if (adminLang === "fr") return item.nameFr || item.nameEn || item.name || "";
        if (adminLang === "ar") return item.nameAr || item.nameEn || item.name || "";
        return item.nameEn || item.name || "";
      }
      function _bLang(item) {
        if (!item) return "";
        if (adminLang === "fr") return item.brandFr || item.brandEn || item.brand || "";
        if (adminLang === "ar") return item.brandAr || item.brandEn || item.brand || "";
        return item.brandEn || item.brand || "";
      }
      function switchAdminLang(lang) {
        adminLang = lang;
        localStorage.setItem("admin_lang", lang);
        _applyLangDir(lang);
        document.querySelectorAll(".tb-lang-btn").forEach(b => b.classList.remove("active"));
        const btn = document.getElementById("lang-btn-" + lang);
        if (btn) btn.classList.add("active");
        renderProducts(_prodFilter);
        renderCats();
        renderBundleList(document.getElementById("bundle-search")?.value || "");
        applyAdminI18n();
        renderNotifList();
        showToast(t('toast.langSwitch'));
      }
      function _applyLangDir(lang) {
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
        document.body.classList.toggle("lang-ar", lang === "ar");
      }

      // ── i18n dictionary ──
      const ADMIN_I18N = {
        en: {
          'nav.main':'Main','nav.store':'Store','nav.admin':'Admin',
          'nav.dashboard':'Dashboard','nav.products':'Products','nav.categories':'Categories',
          'nav.delivery':'Delivery Prices','nav.bundle':'Bundle','nav.announcement':'Announcement','nav.orders':'Orders',
          'nav.stock':'Stock','nav.settings':'Settings','nav.backToSite':'Back to Website',
          'nav.superAdmin':'Super Admin',
          'tb.live':'Live','tb.logout':'Logout',
          'notif.title':'Notifications','notif.clear':'Clear all','notif.empty':'No notifications yet',
          'notif.newOrder':'New order received','notif.justNow':'Just now','notif.minAgo':'m ago','notif.hourAgo':'h ago','notif.dayAgo':'d ago',
          'dash.topProducts':'Top Products Sold','dash.allTime':'All time','dash.viewAll':'View All',
          'dash.recentOrders':'Recent Orders','dash.statusOverview':'Orders Status Overview',
          'stat.products':'Products','stat.totalOrders':'Total Orders',
          'stat.weekOrders':'Orders This Week','stat.weekRevenue':'Revenue This Week (DA)',
          'stat.totalRevenue':'Total Revenue (DA)','stat.pending':'Pending Orders',
          'products.title':'Products','products.add':'Add Product','products.search':'Search products…',
          'products.col.product':'Product','products.col.categories':'Categories',
          'products.col.shades':'Shades / Options','products.col.variants':'Variants / Prices',
          'products.col.stock':'Stock','products.col.status':'Status','products.col.actions':'Actions',
          'products.empty':'No products',
          'cats.title':'Categories','cats.add':'Add Category','cats.empty':'No categories yet',
          'delivery.title':'Delivery Prices','delivery.addWilaya':'Add Wilaya',
          'delivery.freeTitle':'Free Delivery Settings',
          'delivery.minOrder':'Minimum Order for Free Delivery (DA)',
          'delivery.minOrderHint':'When cart total meets or exceeds this amount, delivery is free. Set 0 to disable.',
          'delivery.allFree':'All Deliveries Free','delivery.saveFree':'Save Free Delivery Settings',
          'delivery.search':'Search wilaya…','delivery.col.num':'#','delivery.col.wilaya':'Wilaya',
          'delivery.col.home':'Home Delivery (DA)','delivery.col.office':'Office / Desk (DA)',
          'delivery.col.actions':'Actions',
          'bundle.title':'Bundle','bundle.select':'Select Bundle Product',
          'bundle.selectDesc':'Choose <strong>one product</strong> to feature as the bundle on your store.',
          'bundle.bannerTitle':'Banner Title','bundle.titleEn':'Title (English)','bundle.titleFr':'Title (French)','bundle.titleAr':'Title (Arabic)',
          'bundle.bannerDesc':'Banner Description','bundle.descEn':'Description (English)',
          'bundle.descFr':'Description (French)','bundle.descAr':'Description (Arabic)','bundle.search':'Search products…',
          'bundle.noSelected':'No product selected','bundle.clear':'Clear','bundle.save':'Save Bundle',
          'orders.title':'Orders','orders.refresh':'Refresh',
          'orders.search':'Search name, phone, wilaya…',
          'orders.sort.newest':'Newest First','orders.sort.oldest':'Oldest First',
          'orders.sort.totalDesc':'Highest Total','orders.sort.totalAsc':'Lowest Total',
          'orders.sort.nameAsc':'Name A→Z','orders.sort.nameDesc':'Name Z→A',
          'orders.filter.all':'All','orders.filter.waiting':'Waiting',
          'orders.filter.confirmed':'Confirmed','orders.filter.delivered':'Delivered',
          'orders.filter.canceled':'Canceled',
          'orders.col.num':'#','orders.col.customer':'Customer','orders.col.phone':'Phone',
          'orders.col.wilaya':'Wilaya','orders.col.address':'Address','orders.col.items':'Items',
          'orders.col.total':'Total','orders.col.source':'Source','orders.col.date':'Date',
          'orders.col.status':'Status','orders.col.actions':'Actions','orders.empty':'No orders yet',
          'stock.title':'Stock Management','stock.allProducts':'All Products',
          'stock.outOfStock':'Out of Stock','stock.lowStock':'Low Stock (≤5)','stock.refresh':'Refresh',
          'stock.search':'Search products…',
          'settings.title':'Settings','settings.accountInfo':'Account Info',
          'settings.username':'Username','settings.displayName':'Display Name',
          'settings.saveChanges':'Save Changes','settings.changePass':'Change Password',
          'settings.curPass':'Current Password','settings.newPass':'New Password',
          'settings.confirmPass':'Confirm New Password','settings.updatePass':'Update Password',
          'settings.manageUsers':'Manage Users','settings.email':'Email',
          'settings.password':'Password','settings.createUser':'Create User',
          'common.edit':'Edit','common.delete':'Delete','common.cancel':'Cancel',
          'common.deleteSelected':'Delete Selected','common.enabled':'Enabled','common.disabled':'Disabled',
          'common.save':'Save','common.show':'Show','common.hide':'Hide','common.noData':'No data',
          'pm.addTitle':'Add Product','pm.editTitle':'Edit Product',
          'pm.nameEn':'Product Name (English) *','pm.brandEn':'Brand (English)',
          'pm.nameFr':'Product Name (French)','pm.brandFr':'Brand (French)',
          'pm.nameAr':'Product Name (Arabic)','pm.brandAr':'Brand (Arabic)',
          'pm.categories':'Categories (select one or more)','pm.subcategories':'Sub-Categories',
          'pm.description':'Description','pm.images':'Product Images',
          'pm.variants':'Variants & Prices','pm.addVariant':'Add Variant',
          'pm.customVariants':'Custom variants (free text instead of size)','pm.width':'Width','pm.height':'Height','pm.unit':'Unit',
          'pm.shades':'Shades / Colors / Options','pm.addShade':'Add Shade / Option',
          'pm.totalStock':'Total Stock','pm.discount':'Discount %','pm.status':'Status',
          'pm.freeDelivery':'Free Delivery','pm.freeDeliveryHint':'Ships free regardless of order total',
          'pm.save':'Save Product',
          'cat.addTitle':'Add Category','cat.editTitle':'Edit Category',
          'cat.nameEn':'Name (English) *','cat.nameFr':'Name (French)','cat.nameAr':'Name (Arabic)','cat.desc':'Description','cat.image':'Category Image',
          'cat.subs':'Sub-categories (optional)','cat.addSub':'Add Sub-category','cat.save':'Save Category',
          'subcat.editTitle':'Edit Sub-Category','subcat.nameEn':'Name (English) *',
          'subcat.nameFr':'Name (French)','subcat.nameAr':'Name (Arabic)','subcat.save':'Save Changes',
          'dm.addTitle':'Add Wilaya','dm.editTitle':'Edit Wilaya',
          'dm.wilayaName':'Wilaya Name *','dm.homePrice':'Home Delivery Price (DA) *',
          'dm.officePrice':'Office / Desk Price (DA) *','dm.save':'Save',
          'confirm.title':'Are you sure?','confirm.default':'This action cannot be undone.',
          'confirm.delete':'Delete',
          'page.dashboard':'Dashboard','page.products':'Products','page.categories':'Categories',
          'page.delivery':'Delivery Prices','page.bundle':'Bundle','page.announcement':'Announcement','page.orders':'Orders',
          'announcement.title':'Announcement Bar','announcement.select':'Top Announcement Bar','announcement.desc':'Shown as a scrolling red bar above the header on every page. Leave the text empty or disable it to hide it.',
          'announcement.textLabel':'Announcement Text','announcement.textEn':'Text (English) *','announcement.textFr':'Text (French)','announcement.textAr':'Text (Arabic)',
          'announcement.linkLabel':'Link (optional)','announcement.linkTextEn':'Link Text (English)','announcement.linkTextFr':'Link Text (French)','announcement.linkTextAr':'Link Text (Arabic)','announcement.linkUrl':'Link URL',
          'announcement.save':'Save Announcement',
          'page.stock':'Stock Management','page.settings':'Settings',
          'status.active':'Active','status.inactive':'Inactive','status.waiting':'Waiting',
          'status.confirmed':'Confirmed','status.delivered':'Delivered','status.canceled':'Canceled',
          'toast.langSwitch':'Language: English',
          'sel.items':'items selected','sel.item':'item selected',
        },
        fr: {
          'nav.main':'Principal','nav.store':'Boutique','nav.admin':'Administration',
          'nav.dashboard':'Tableau de bord','nav.products':'Produits','nav.categories':'Catégories',
          'nav.delivery':'Prix de livraison','nav.bundle':'Coffret','nav.announcement':'Annonce','nav.orders':'Commandes',
          'nav.stock':'Stock','nav.settings':'Paramètres','nav.backToSite':'Retour au site',
          'nav.superAdmin':'Super Administrateur',
          'tb.live':'En direct','tb.logout':'Déconnexion',
          'notif.title':'Notifications','notif.clear':'Tout effacer','notif.empty':'Aucune notification',
          'notif.newOrder':'Nouvelle commande reçue','notif.justNow':'À l\'instant','notif.minAgo':'min','notif.hourAgo':'h','notif.dayAgo':'j',
          'dash.topProducts':'Produits les plus vendus','dash.allTime':'Depuis toujours','dash.viewAll':'Voir tout',
          'dash.recentOrders':'Commandes récentes','dash.statusOverview':'Aperçu des statuts',
          'stat.products':'Produits','stat.totalOrders':'Total commandes',
          'stat.weekOrders':'Commandes cette semaine','stat.weekRevenue':'Revenus cette semaine (DA)',
          'stat.totalRevenue':'Revenus totaux (DA)','stat.pending':'Commandes en attente',
          'products.title':'Produits','products.add':'Ajouter un produit','products.search':'Rechercher des produits…',
          'products.col.product':'Produit','products.col.categories':'Catégories',
          'products.col.shades':'Teintes / Options','products.col.variants':'Variantes / Prix',
          'products.col.stock':'Stock','products.col.status':'Statut','products.col.actions':'Actions',
          'products.empty':'Aucun produit',
          'cats.title':'Catégories','cats.add':'Ajouter une catégorie','cats.empty':'Aucune catégorie',
          'delivery.title':'Prix de livraison','delivery.addWilaya':'Ajouter une wilaya',
          'delivery.freeTitle':'Paramètres livraison gratuite',
          'delivery.minOrder':'Commande minimale pour livraison gratuite (DA)',
          'delivery.minOrderHint':'Quand le panier atteint ce montant, la livraison est gratuite. 0 pour désactiver.',
          'delivery.allFree':'Toutes les livraisons gratuites','delivery.saveFree':'Enregistrer les paramètres',
          'delivery.search':'Rechercher une wilaya…','delivery.col.num':'N°','delivery.col.wilaya':'Wilaya',
          'delivery.col.home':'Livraison domicile (DA)','delivery.col.office':'Bureau / Relais (DA)',
          'delivery.col.actions':'Actions',
          'bundle.title':'Coffret','bundle.select':'Sélectionner le produit coffret',
          'bundle.selectDesc':'Choisissez <strong>un produit</strong> à mettre en avant comme coffret.',
          'bundle.bannerTitle':'Titre de la bannière','bundle.titleEn':'Titre (Anglais)','bundle.titleFr':'Titre (Français)','bundle.titleAr':'Titre (Arabe)',
          'bundle.bannerDesc':'Description de la bannière','bundle.descEn':'Description (Anglais)',
          'bundle.descFr':'Description (Français)','bundle.descAr':'Description (Arabe)','bundle.search':'Rechercher des produits…',
          'bundle.noSelected':'Aucun produit sélectionné','bundle.clear':'Effacer','bundle.save':'Enregistrer le coffret',
          'orders.title':'Commandes','orders.refresh':'Actualiser',
          'orders.search':'Rechercher nom, téléphone, wilaya…',
          'orders.sort.newest':'Plus récent','orders.sort.oldest':'Plus ancien',
          'orders.sort.totalDesc':'Total le plus élevé','orders.sort.totalAsc':'Total le plus bas',
          'orders.sort.nameAsc':'Nom A→Z','orders.sort.nameDesc':'Nom Z→A',
          'orders.filter.all':'Tous','orders.filter.waiting':'En attente',
          'orders.filter.confirmed':'Confirmé','orders.filter.delivered':'Livré',
          'orders.filter.canceled':'Annulé',
          'orders.col.num':'N°','orders.col.customer':'Client','orders.col.phone':'Téléphone',
          'orders.col.wilaya':'Wilaya','orders.col.address':'Adresse','orders.col.items':'Articles',
          'orders.col.total':'Total','orders.col.source':'Source','orders.col.date':'Date',
          'orders.col.status':'Statut','orders.col.actions':'Actions','orders.empty':'Aucune commande',
          'stock.title':'Gestion du stock','stock.allProducts':'Tous les produits',
          'stock.outOfStock':'Rupture de stock','stock.lowStock':'Stock faible (≤5)','stock.refresh':'Actualiser',
          'stock.search':'Rechercher des produits…',
          'settings.title':'Paramètres','settings.accountInfo':'Informations du compte',
          'settings.username':"Nom d'utilisateur",'settings.displayName':'Nom affiché',
          'settings.saveChanges':'Enregistrer','settings.changePass':'Changer le mot de passe',
          'settings.curPass':'Mot de passe actuel','settings.newPass':'Nouveau mot de passe',
          'settings.confirmPass':'Confirmer le nouveau mot de passe','settings.updatePass':'Mettre à jour',
          'settings.manageUsers':'Gérer les utilisateurs','settings.email':'E-mail',
          'settings.password':'Mot de passe','settings.createUser':'Créer un utilisateur',
          'common.edit':'Modifier','common.delete':'Supprimer','common.cancel':'Annuler',
          'common.deleteSelected':'Supprimer la sélection','common.enabled':'Activé','common.disabled':'Désactivé',
          'common.save':'Enregistrer','common.show':'Afficher','common.hide':'Masquer','common.noData':'Aucune donnée',
          'pm.addTitle':'Ajouter un produit','pm.editTitle':'Modifier le produit',
          'pm.nameEn':'Nom du produit (Anglais) *','pm.brandEn':'Marque (Anglais)',
          'pm.nameFr':'Nom du produit (Français)','pm.brandFr':'Marque (Français)',
          'pm.nameAr':'Nom du produit (Arabe)','pm.brandAr':'Marque (Arabe)',
          'pm.categories':'Catégories (sélectionner une ou plusieurs)','pm.subcategories':'Sous-catégories',
          'pm.description':'Description','pm.images':'Images du produit',
          'pm.variants':'Variantes & Prix','pm.addVariant':'Ajouter une variante',
          'pm.customVariants':'Variantes personnalisées (texte libre au lieu de taille)','pm.width':'Largeur','pm.height':'Hauteur','pm.unit':'Unité',
          'pm.shades':'Teintes / Couleurs / Options','pm.addShade':'Ajouter une teinte / option',
          'pm.totalStock':'Stock total','pm.discount':'Remise %','pm.status':'Statut',
          'pm.freeDelivery':'Livraison gratuite','pm.freeDeliveryHint':'Livré gratuitement quel que soit le total',
          'pm.save':'Enregistrer le produit',
          'cat.addTitle':'Ajouter une catégorie','cat.editTitle':'Modifier la catégorie',
          'cat.nameEn':'Nom (Anglais) *','cat.nameFr':'Nom (Français)','cat.nameAr':'Nom (Arabe)','cat.desc':'Description','cat.image':'Image de la catégorie',
          'cat.subs':'Sous-catégories (optionnel)','cat.addSub':'Ajouter une sous-catégorie','cat.save':'Enregistrer la catégorie',
          'subcat.editTitle':'Modifier la sous-catégorie','subcat.nameEn':'Nom (Anglais) *',
          'subcat.nameFr':'Nom (Français)','subcat.nameAr':'Nom (Arabe)','subcat.save':'Enregistrer',
          'dm.addTitle':'Ajouter une wilaya','dm.editTitle':'Modifier la wilaya',
          'dm.wilayaName':'Nom de la wilaya *','dm.homePrice':'Prix livraison domicile (DA) *',
          'dm.officePrice':'Prix bureau / relais (DA) *','dm.save':'Enregistrer',
          'confirm.title':'Êtes-vous sûr ?','confirm.default':'Cette action est irréversible.',
          'confirm.delete':'Supprimer',
          'page.dashboard':'Tableau de bord','page.products':'Produits','page.categories':'Catégories',
          'page.delivery':'Prix de livraison','page.bundle':'Coffret','page.announcement':'Annonce','page.orders':'Commandes',
          'announcement.title':'Barre d\'annonce','announcement.select':'Barre d\'annonce en haut','announcement.desc':'Affichée comme une bande rouge défilante au-dessus de l\'en-tête sur chaque page. Laissez le texte vide ou désactivez-la pour la masquer.',
          'announcement.textLabel':'Texte de l\'annonce','announcement.textEn':'Texte (Anglais) *','announcement.textFr':'Texte (Français)','announcement.textAr':'Texte (Arabe)',
          'announcement.linkLabel':'Lien (optionnel)','announcement.linkTextEn':'Texte du lien (Anglais)','announcement.linkTextFr':'Texte du lien (Français)','announcement.linkTextAr':'Texte du lien (Arabe)','announcement.linkUrl':'URL du lien',
          'announcement.save':'Enregistrer l\'annonce',
          'page.stock':'Gestion du stock','page.settings':'Paramètres',
          'status.active':'Actif','status.inactive':'Inactif','status.waiting':'En attente',
          'status.confirmed':'Confirmé','status.delivered':'Livré','status.canceled':'Annulé',
          'toast.langSwitch':'Langue : Français',
          'sel.items':'éléments sélectionnés','sel.item':'élément sélectionné',
        },
        ar: {
          'nav.main':'الرئيسية','nav.store':'المتجر','nav.admin':'الإدارة',
          'nav.dashboard':'لوحة التحكم','nav.products':'المنتجات','nav.categories':'الفئات',
          'nav.delivery':'أسعار التوصيل','nav.bundle':'الحزمة','nav.announcement':'الإعلان','nav.orders':'الطلبات',
          'nav.stock':'المخزون','nav.settings':'الإعدادات','nav.backToSite':'العودة للموقع',
          'nav.superAdmin':'مدير عام',
          'tb.live':'مباشر','tb.logout':'تسجيل الخروج',
          'notif.title':'الإشعارات','notif.clear':'مسح الكل','notif.empty':'لا توجد إشعارات',
          'notif.newOrder':'طلب جديد','notif.justNow':'الآن','notif.minAgo':'د','notif.hourAgo':'س','notif.dayAgo':'ي',
          'dash.topProducts':'الأكثر مبيعًا','dash.allTime':'كل الوقت','dash.viewAll':'عرض الكل',
          'dash.recentOrders':'أحدث الطلبات','dash.statusOverview':'نظرة عامة على الحالة',
          'stat.products':'المنتجات','stat.totalOrders':'إجمالي الطلبات',
          'stat.weekOrders':'طلبات هذا الأسبوع','stat.weekRevenue':'إيرادات الأسبوع (دج)',
          'stat.totalRevenue':'إجمالي الإيرادات (دج)','stat.pending':'طلبات معلقة',
          'products.title':'المنتجات','products.add':'إضافة منتج','products.search':'ابحث عن منتجات…',
          'products.col.product':'المنتج','products.col.categories':'الفئات',
          'products.col.shades':'الألوان / الخيارات','products.col.variants':'الأنواع / الأسعار',
          'products.col.stock':'المخزون','products.col.status':'الحالة','products.col.actions':'إجراءات',
          'products.empty':'لا توجد منتجات',
          'cats.title':'الفئات','cats.add':'إضافة فئة','cats.empty':'لا توجد فئات بعد',
          'delivery.title':'أسعار التوصيل','delivery.addWilaya':'إضافة ولاية',
          'delivery.freeTitle':'إعدادات التوصيل المجاني',
          'delivery.minOrder':'الحد الأدنى للطلب للتوصيل المجاني (دج)',
          'delivery.minOrderHint':'عندما يبلغ مجموع السلة هذا المبلغ أو يتجاوزه، يكون التوصيل مجانيًا. ضع 0 للتعطيل.',
          'delivery.allFree':'كل التوصيلات مجانية','delivery.saveFree':'حفظ إعدادات التوصيل المجاني',
          'delivery.search':'ابحث عن ولاية…','delivery.col.num':'#','delivery.col.wilaya':'الولاية',
          'delivery.col.home':'توصيل المنزل (دج)','delivery.col.office':'المكتب (دج)',
          'delivery.col.actions':'إجراءات',
          'bundle.title':'الحزمة','bundle.select':'اختر منتج الحزمة',
          'bundle.selectDesc':'اختر <strong>منتجًا واحدًا</strong> لعرضه كحزمة في متجرك.',
          'bundle.bannerTitle':'عنوان البانر','bundle.titleEn':'العنوان (إنجليزي)','bundle.titleFr':'العنوان (فرنسي)','bundle.titleAr':'العنوان (عربي)',
          'bundle.bannerDesc':'وصف البانر','bundle.descEn':'الوصف (إنجليزي)',
          'bundle.descFr':'الوصف (فرنسي)','bundle.descAr':'الوصف (عربي)','bundle.search':'ابحث عن منتجات…',
          'bundle.noSelected':'لم يتم اختيار منتج','bundle.clear':'مسح','bundle.save':'حفظ الحزمة',
          'orders.title':'الطلبات','orders.refresh':'تحديث',
          'orders.search':'ابحث بالاسم، الهاتف، الولاية…',
          'orders.sort.newest':'الأحدث أولاً','orders.sort.oldest':'الأقدم أولاً',
          'orders.sort.totalDesc':'الأعلى سعرًا','orders.sort.totalAsc':'الأقل سعرًا',
          'orders.sort.nameAsc':'الاسم أ→ي','orders.sort.nameDesc':'الاسم ي→أ',
          'orders.filter.all':'الكل','orders.filter.waiting':'قيد الانتظار',
          'orders.filter.confirmed':'مؤكد','orders.filter.delivered':'تم التوصيل',
          'orders.filter.canceled':'ملغى',
          'orders.col.num':'#','orders.col.customer':'العميل','orders.col.phone':'الهاتف',
          'orders.col.wilaya':'الولاية','orders.col.address':'العنوان','orders.col.items':'العناصر',
          'orders.col.total':'الإجمالي','orders.col.source':'المصدر','orders.col.date':'التاريخ',
          'orders.col.status':'الحالة','orders.col.actions':'إجراءات','orders.empty':'لا توجد طلبات بعد',
          'stock.title':'إدارة المخزون','stock.allProducts':'كل المنتجات',
          'stock.outOfStock':'نفد المخزون','stock.lowStock':'مخزون منخفض (≤5)','stock.refresh':'تحديث',
          'stock.search':'ابحث عن منتجات…',
          'settings.title':'الإعدادات','settings.accountInfo':'معلومات الحساب',
          'settings.username':'اسم المستخدم','settings.displayName':'الاسم المعروض',
          'settings.saveChanges':'حفظ التغييرات','settings.changePass':'تغيير كلمة المرور',
          'settings.curPass':'كلمة المرور الحالية','settings.newPass':'كلمة المرور الجديدة',
          'settings.confirmPass':'تأكيد كلمة المرور الجديدة','settings.updatePass':'تحديث كلمة المرور',
          'settings.manageUsers':'إدارة المستخدمين','settings.email':'البريد الإلكتروني',
          'settings.password':'كلمة المرور','settings.createUser':'إنشاء مستخدم',
          'common.edit':'تعديل','common.delete':'حذف','common.cancel':'إلغاء',
          'common.deleteSelected':'حذف المحدد','common.enabled':'مفعّل','common.disabled':'معطّل',
          'common.save':'حفظ','common.show':'إظهار','common.hide':'إخفاء','common.noData':'لا توجد بيانات',
          'pm.addTitle':'إضافة منتج','pm.editTitle':'تعديل المنتج',
          'pm.nameEn':'اسم المنتج (إنجليزي) *','pm.brandEn':'العلامة التجارية (إنجليزي)',
          'pm.nameFr':'اسم المنتج (فرنسي)','pm.brandFr':'العلامة التجارية (فرنسي)',
          'pm.nameAr':'اسم المنتج (عربي)','pm.brandAr':'العلامة التجارية (عربي)',
          'pm.categories':'الفئات (اختر واحدة أو أكثر)','pm.subcategories':'الفئات الفرعية',
          'pm.description':'الوصف','pm.images':'صور المنتج',
          'pm.variants':'الأنواع والأسعار','pm.addVariant':'إضافة نوع',
          'pm.customVariants':'أنواع مخصصة (نص حر بدلاً من المقاس)','pm.width':'العرض','pm.height':'الطول','pm.unit':'الوحدة',
          'pm.shades':'الألوان / الخيارات','pm.addShade':'إضافة لون / خيار',
          'pm.totalStock':'إجمالي المخزون','pm.discount':'الخصم %','pm.status':'الحالة',
          'pm.freeDelivery':'توصيل مجاني','pm.freeDeliveryHint':'يُشحن مجانًا بغض النظر عن إجمالي الطلب',
          'pm.save':'حفظ المنتج',
          'cat.addTitle':'إضافة فئة','cat.editTitle':'تعديل الفئة',
          'cat.nameEn':'الاسم (إنجليزي) *','cat.nameFr':'الاسم (فرنسي)','cat.nameAr':'الاسم (عربي)','cat.desc':'الوصف','cat.image':'صورة الفئة',
          'cat.subs':'الفئات الفرعية (اختياري)','cat.addSub':'إضافة فئة فرعية','cat.save':'حفظ الفئة',
          'subcat.editTitle':'تعديل الفئة الفرعية','subcat.nameEn':'الاسم (إنجليزي) *',
          'subcat.nameFr':'الاسم (فرنسي)','subcat.nameAr':'الاسم (عربي)','subcat.save':'حفظ التغييرات',
          'dm.addTitle':'إضافة ولاية','dm.editTitle':'تعديل الولاية',
          'dm.wilayaName':'اسم الولاية *','dm.homePrice':'سعر التوصيل للمنزل (دج) *',
          'dm.officePrice':'سعر المكتب (دج) *','dm.save':'حفظ',
          'confirm.title':'هل أنت متأكد؟','confirm.default':'لا يمكن التراجع عن هذا الإجراء.',
          'confirm.delete':'حذف',
          'page.dashboard':'لوحة التحكم','page.products':'المنتجات','page.categories':'الفئات',
          'page.delivery':'أسعار التوصيل','page.bundle':'الحزمة','page.announcement':'الإعلان','page.orders':'الطلبات',
          'announcement.title':'شريط الإعلان','announcement.select':'شريط الإعلان العلوي','announcement.desc':'يظهر كشريط أحمر متحرك أعلى الترويسة في كل صفحة. اترك النص فارغًا أو عطّله لإخفائه.',
          'announcement.textLabel':'نص الإعلان','announcement.textEn':'النص (إنجليزي) *','announcement.textFr':'النص (فرنسي)','announcement.textAr':'النص (عربي)',
          'announcement.linkLabel':'رابط (اختياري)','announcement.linkTextEn':'نص الرابط (إنجليزي)','announcement.linkTextFr':'نص الرابط (فرنسي)','announcement.linkTextAr':'نص الرابط (عربي)','announcement.linkUrl':'رابط URL',
          'announcement.save':'حفظ الإعلان',
          'page.stock':'إدارة المخزون','page.settings':'الإعدادات',
          'status.active':'نشط','status.inactive':'غير نشط','status.waiting':'قيد الانتظار',
          'status.confirmed':'مؤكد','status.delivered':'تم التوصيل','status.canceled':'ملغى',
          'toast.langSwitch':'اللغة: العربية',
          'sel.items':'عناصر محددة','sel.item':'عنصر محدد',
        }
      };
      function t(key) {
        return (ADMIN_I18N[adminLang] || ADMIN_I18N.en)[key] || (ADMIN_I18N.en)[key] || key;
      }
      function tStatus(s) {
        return t('status.' + s) || cap(s);
      }
      function applyAdminI18n() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
          const key = el.dataset.i18n;
          const val = t(key);
          if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = val;
          } else if (el.dataset.i18nHtml) {
            el.innerHTML = val;
          } else {
            el.textContent = val;
          }
        });
      }

      function _pagCtrl(total, cur, setFn) {
        const totalPages = Math.ceil(total / _PAGE);
        if (totalPages <= 1) return "";
        const from = (cur - 1) * _PAGE + 1;
        const to = Math.min(cur * _PAGE, total);
        let btns = "";
        if (cur > 1) btns += `<button class="pag-btn" onclick="${setFn}(${cur - 1})">&#8249;</button>`;
        for (let i = 1; i <= totalPages; i++) {
          if (i === 1 || i === totalPages || (i >= cur - 2 && i <= cur + 2)) {
            btns += `<button class="pag-btn${i === cur ? " active" : ""}" onclick="${setFn}(${i})">${i}</button>`;
          } else if (i === cur - 3 || i === cur + 3) {
            btns += `<button class="pag-btn" style="cursor:default;pointer-events:none" disabled>&#8230;</button>`;
          }
        }
        if (cur < totalPages) btns += `<button class="pag-btn" onclick="${setFn}(${cur + 1})">&#8250;</button>`;
        return `<div class="pag-wrap"><span class="pag-info">Showing ${from}–${to} of ${total}</span><div class="pag-btns">${btns}</div></div>`;
      }
      function setProductPage(n) { productPage = n; renderProducts(_prodFilter); }
      function setCatPage(n) { catPage = n; renderCats(); }
      function setDeliveryPage(n) { deliveryPage = n; renderDelivery(_delFilter); }
      function setOrderPage(n) { orderPage = n; _fetchOrdersPage().then(renderOrders).catch(() => renderOrders()); }

      async function _fetchOrdersPage() {
        const from = (orderPage - 1) * _PAGE;
        const to = from + _PAGE - 1;
        let q = sb.from("orders").select("*", { count: "exact" });
        if (ordersFilter !== "all") q = q.eq("status", ordersFilter);
        if (ordersSearch) {
          q = q.or(
            `first_name.ilike.%${ordersSearch}%,last_name.ilike.%${ordersSearch}%,phone.ilike.%${ordersSearch}%,wilaya.ilike.%${ordersSearch}%,commune.ilike.%${ordersSearch}%`
          );
        }
        switch (ordersSort) {
          case "date-asc":   q = q.order("created_at", { ascending: true }); break;
          case "total-desc": q = q.order("total", { ascending: false }); break;
          case "total-asc":  q = q.order("total", { ascending: true }); break;
          case "name-asc":   q = q.order("first_name", { ascending: true }); break;
          case "name-desc":  q = q.order("first_name", { ascending: false }); break;
          default:           q = q.order("created_at", { ascending: false });
        }
        const { data, count, error } = await q.range(from, to);
        if (error) throw error;
        orders = (data || []).map(_remapOrderRow);
        ordersTotal = count || 0;
      }

      async function _fetchDashOrders() {
        const { data } = await sb.from("orders")
          .select("id,status,total,created_at,items,first_name,last_name,phone,wilaya")
          .order("created_at", { ascending: false });
        _dashOrders = (data || []).map(o => ({
          id: o.id, status: o.status, total: o.total,
          createdAt: o.created_at, items: o.items || [],
          firstName: o.first_name || "", lastName: o.last_name || "",
          phone: o.phone || "", wilaya: o.wilaya || ""
        }));
      }

      // ════════════════════════════════════════════
      // ROW MAPPERS (snake_case → camelCase)
      // ════════════════════════════════════════════
      function _remapProductRow(r) {
        return { id: r.id, name: r.name_en || r.name || "", nameEn: r.name_en || r.name || "", nameFr: r.name_fr || "", nameAr: r.name_ar || "", brand: r.brand_en || r.brand || "", brandEn: r.brand_en || r.brand || "", brandFr: r.brand_fr || "", brandAr: r.brand_ar || "", categoryIds: (r.category_ids || "").split(",").filter(Boolean), subCategoryIds: (r.sub_category_ids || "").split(",").filter(Boolean), subSubCategoryIds: (r.sub_sub_category_ids || "").split(",").filter(Boolean), description: r.description_en || r.description || "", descriptionEn: r.description_en || r.description || "", descriptionFr: r.description_fr || "", descriptionAr: r.description_ar || "", imageUrl: r.image_url || [], variants: r.variants || [], flavors: r.flavors || [], stock: r.stock, discount: r.discount, freeDelivery: r.free_delivery === true || r.free_delivery === "true", status: r.status, hidden: r.hidden || false, createdAt: r.created_at };
      }
      function _remapCategoryRow(r) {
        return { id: r.id, name: r.name_en || r.name || "", nameEn: r.name_en || "", nameFr: r.name_fr || "", nameAr: r.name_ar || "", description: r.description, imageUrl: r.image_url || "", createdAt: r.created_at };
      }
      function _remapSubCategoryRow(r) {
        return { id: r.id, name: r.name_en || r.name || "", nameEn: r.name_en || "", nameFr: r.name_fr || "", nameAr: r.name_ar || "", categoryIds: (r.category_ids || "").split(",").filter(Boolean), createdAt: r.created_at };
      }
      function _remapSubSubCategoryRow(r) {
        return { id: r.id, name: r.name_en || r.name || "", nameEn: r.name_en || "", nameFr: r.name_fr || "", nameAr: r.name_ar || "", subCategoryIds: (r.sub_category_ids || "").split(",").filter(Boolean), createdAt: r.created_at };
      }
      function _remapDeliveryRow(r) {
        return { id: r.id, wilaya: r.wilaya, homePrice: r.home_price, officePrice: r.office_price, createdAt: r.created_at };
      }
      function _remapOrderRow(r) {
        return { id: r.id, source: r.source, firstName: r.first_name, lastName: r.last_name, phone: r.phone, address: r.address, wilaya: r.wilaya, commune: r.commune, deliveryType: r.delivery_type, deliveryCost: r.delivery_cost, items: r.items || [], subtotal: r.subtotal, total: r.total, status: r.status, createdAt: r.created_at };
      }
      // ROW BUILDERS (camelCase → snake_case)
      function _toProductRow(p) {
        return { name: p.nameEn || p.name || "", name_en: p.nameEn || "", name_fr: p.nameFr || "", name_ar: p.nameAr || "", brand: p.brandEn || p.brand || "", brand_en: p.brandEn || "", brand_fr: p.brandFr || "", brand_ar: p.brandAr || "", category_ids: (p.categoryIds || []).join(","), sub_category_ids: (p.subCategoryIds || []).join(","), sub_sub_category_ids: (p.subSubCategoryIds || []).join(","), description: p.descriptionEn || p.description || "", description_en: p.descriptionEn || "", description_fr: p.descriptionFr || "", description_ar: p.descriptionAr || "", image_url: p.imageUrl || [], variants: p.variants || [], flavors: p.flavors || [], stock: p.stock || 0, discount: p.discount || 0, free_delivery: p.freeDelivery || false, status: p.status || "active", hidden: p.hidden || false };
      }
      async function _saveSubSubCategories(subId, list) {
        for (const ssc of (list || [])) {
          if (!ssc) continue;
          const nameEn = (ssc.nameEn || ssc.name || "").trim();
          if (ssc.id) {
            await sb.from("sub_sub_categories").update({ name: nameEn || ssc.name || "", name_en: nameEn, name_fr: ssc.nameFr || "", name_ar: ssc.nameAr || "" }).eq("id", ssc.id);
          } else if (nameEn) {
            await new Promise((r) => setTimeout(r, 5));
            await sb.from("sub_sub_categories").insert({ id: String(Date.now()), name: nameEn, name_en: nameEn, name_fr: ssc.nameFr || "", name_ar: ssc.nameAr || "", sub_category_ids: subId });
          }
        }
      }
      // ════════════════════════════════════════════
      // API HELPERS (Supabase)
      // ════════════════════════════════════════════
      async function apiGet(action, params = {}) {
        switch (action) {
          case "getInitialData": {
            const [
              { data: prods, error: e1 }, { data: cats, error: e2 }, { data: subs, error: e3 },
              { data: subSubs, error: e4 },
              { data: dpRows, error: e5 },
              { data: bndRow, error: e6 },
            ] = await Promise.all([
              sb.from("products").select("*").order("created_at", { ascending: false }),
              sb.from("categories").select("*").order("created_at", { ascending: true }),
              sb.from("sub_categories").select("*"),
              sb.from("sub_sub_categories").select("*"),
              sb.from("delivery_prices").select("*").order("wilaya", { ascending: true }),
              sb.from("bundle").select("*").limit(1).maybeSingle(),
            ]);
            if (e1 || e2 || e3 || e4 || e5 || e6) throw e1 || e2 || e3 || e4 || e5 || e6;
            return { success: true, products: (prods || []).map(_remapProductRow), categories: (cats || []).map(_remapCategoryRow), subCategories: (subs || []).map(_remapSubCategoryRow), subSubCategories: (subSubs || []).map(_remapSubSubCategoryRow), deliveryPrices: (dpRows || []).map(_remapDeliveryRow), bundle: bndRow ? { bundleId: bndRow.bundle_id, bundleDescription: bndRow.description_en } : {} };
          }
          case "getProducts": {
            const { data, error } = await sb.from("products").select("*").order("created_at", { ascending: false });
            if (error) throw error;
            return { success: true, products: (data || []).map(_remapProductRow) };
          }
          case "getCategories": {
            const { data, error } = await sb.from("categories").select("*").order("created_at", { ascending: true });
            if (error) throw error;
            return { success: true, categories: (data || []).map(_remapCategoryRow) };
          }
          case "getSubCategories": {
            const { data, error } = await sb.from("sub_categories").select("*");
            if (error) throw error;
            return { success: true, subCategories: (data || []).map(_remapSubCategoryRow) };
          }
          case "getSubSubCategories": {
            const { data, error } = await sb.from("sub_sub_categories").select("*");
            if (error) throw error;
            return { success: true, subSubCategories: (data || []).map(_remapSubSubCategoryRow) };
          }
          case "getDeliveryPrices": {
            const { data, error } = await sb.from("delivery_prices").select("*").order("wilaya", { ascending: true });
            if (error) throw error;
            return { success: true, deliveryPrices: (data || []).map(_remapDeliveryRow) };
          }
          case "getBundle": {
            const { data, error } = await sb.from("bundle").select("*").limit(1).maybeSingle();
            if (error) throw error;
            return {
              success: true,
              bundleId: data?.bundle_id || "",
              titleEn: data?.title_en || "",
              titleFr: data?.title_fr || "",
              titleAr: data?.title_ar || "",
              descriptionEn: data?.description_en || "",
              descriptionFr: data?.description_fr || "",
              descriptionAr: data?.description_ar || "",
            };
          }
          case "getOrders": {
            const { data, error } = await sb.from("orders").select("*").order("created_at", { ascending: false });
            if (error) throw error;
            return { success: true, orders: (data || []).map(_remapOrderRow) };
          }
          case "getSettings": {
            const { data, error } = await sb.from("settings").select("*");
            if (error) throw error;
            const s = {};
            (data || []).forEach((row) => { s[row.key] = row.value; });
            return { success: true, settings: s };
          }
          case "login": {
            const { data: authData, error } = await sb.auth.signInWithPassword({ email: params.username, password: params.password });
            return { success: !error && !!authData?.session };
          }
          default:
            return { success: false, error: "Unknown action: " + action };
        }
      }

      async function apiPost(body) {
        const { action, id, ...rest } = body;
        switch (action) {
          // ── PRODUCTS ──
          case "addProduct": {
            const row = _toProductRow(rest);
            row.id = String(Date.now());
            const { data, error } = await sb.from("products").insert(row).select().single();
            if (error) throw error;
            return { success: true, id: data.id };
          }
          case "updateProduct": {
            const { error } = await sb.from("products").update(_toProductRow(rest)).eq("id", id);
            if (error) throw error;
            return { success: true };
          }
          case "deleteProduct": {
            const { error } = await sb.from("products").delete().eq("id", id);
            if (error) throw error;
            return { success: true };
          }
          // ── CATEGORIES ──
          case "addCategory": {
            const catId = String(Date.now());
            const { error: catErr } = await sb.from("categories").insert({ id: catId, name: rest.nameEn || rest.name || "", name_en: rest.nameEn || "", name_fr: rest.nameFr || "", name_ar: rest.nameAr || "", description: rest.description || "", image_url: rest.imageUrl || "" });
            if (catErr) throw catErr;
            for (const sub of (rest.subCategories || [])) {
              if (!sub) continue;
              const subName = typeof sub === "string" ? sub : (sub.nameEn || sub.name || "");
              if (!subName) continue;
              await new Promise((r) => setTimeout(r, 5));
              const subId = String(Date.now());
              await sb.from("sub_categories").insert({ id: subId, name: subName, name_en: typeof sub === "string" ? sub : (sub.nameEn || ""), name_fr: typeof sub === "string" ? "" : (sub.nameFr || ""), name_ar: typeof sub === "string" ? "" : (sub.nameAr || ""), category_ids: catId });
              if (typeof sub !== "string" && Array.isArray(sub.subSubCategories)) {
                await _saveSubSubCategories(subId, sub.subSubCategories);
              }
            }
            return { success: true, id: catId };
          }
          case "updateCategory": {
            const { error } = await sb.from("categories").update({ name: rest.nameEn || rest.name || "", name_en: rest.nameEn || "", name_fr: rest.nameFr || "", name_ar: rest.nameAr || "", description: rest.description || "", image_url: rest.imageUrl || "" }).eq("id", id);
            if (error) throw error;
            for (const sub of (rest.subCategories || [])) {
              const subName = sub.nameEn || sub.name || "";
              let subId = sub.id || "";
              if (subId) {
                await sb.from("sub_categories").update({ name: subName, name_en: sub.nameEn || "", name_fr: sub.nameFr || "", name_ar: sub.nameAr || "" }).eq("id", subId);
              } else if (subName) {
                await new Promise((r) => setTimeout(r, 5));
                subId = String(Date.now());
                await sb.from("sub_categories").insert({ id: subId, name: subName, name_en: sub.nameEn || "", name_fr: sub.nameFr || "", name_ar: sub.nameAr || "", category_ids: id });
              }
              if (subId && Array.isArray(sub.subSubCategories)) {
                await _saveSubSubCategories(subId, sub.subSubCategories);
              }
            }
            return { success: true };
          }
          case "deleteCategory": {
            const { data: subsOfCat } = await sb.from("sub_categories").select("id").like("category_ids", "%" + id + "%");
            for (const s of (subsOfCat || [])) {
              await sb.from("sub_sub_categories").delete().like("sub_category_ids", "%" + s.id + "%");
            }
            await sb.from("sub_categories").delete().like("category_ids", "%" + id + "%");
            const { error } = await sb.from("categories").delete().eq("id", id);
            if (error) throw error;
            return { success: true };
          }
          case "updateSubCategory": {
            const { error } = await sb.from("sub_categories").update({ name: rest.nameEn || rest.name || "", name_en: rest.nameEn || "", name_fr: rest.nameFr || "", name_ar: rest.nameAr || "" }).eq("id", id);
            if (error) throw error;
            return { success: true };
          }
          case "deleteSubCategory": {
            await sb.from("sub_sub_categories").delete().like("sub_category_ids", "%" + id + "%");
            const { error } = await sb.from("sub_categories").delete().eq("id", id);
            if (error) throw error;
            return { success: true };
          }
          case "updateSubSubCategory": {
            const { error } = await sb.from("sub_sub_categories").update({ name: rest.nameEn || rest.name || "", name_en: rest.nameEn || "", name_fr: rest.nameFr || "", name_ar: rest.nameAr || "" }).eq("id", id);
            if (error) throw error;
            return { success: true };
          }
          case "deleteSubSubCategory": {
            const { error } = await sb.from("sub_sub_categories").delete().eq("id", id);
            if (error) throw error;
            return { success: true };
          }
          // ── DELIVERY ──
          case "addDeliveryPrice": {
            const row = { id: String(Date.now()), wilaya: rest.wilaya, home_price: rest.homePrice, office_price: rest.officePrice };
            const { data, error } = await sb.from("delivery_prices").insert(row).select().single();
            if (error) throw error;
            return { success: true, id: data.id };
          }
          case "updateDeliveryPrice": {
            const { error } = await sb.from("delivery_prices").update({ wilaya: rest.wilaya, home_price: rest.homePrice, office_price: rest.officePrice }).eq("id", id);
            if (error) throw error;
            return { success: true };
          }
          case "deleteDeliveryPrice": {
            const { error } = await sb.from("delivery_prices").delete().eq("id", id);
            if (error) throw error;
            return { success: true };
          }
          // ── BUNDLE ──
          case "saveBundle": {
            // bundle_id is the table's primary key (it's the selected product's id),
            // so it can't be targeted with a stable .eq("id", ...) update — instead
            // replace the single settings row.
            await sb.from("bundle").delete().neq("bundle_id", "__none__");
            const { error } = await sb.from("bundle").insert({
              bundle_id:      rest.bundleId || "",
              title_en:       rest.titleEn || "",
              title_fr:       rest.titleFr || "",
              title_ar:       rest.titleAr || "",
              description_en: rest.descriptionEn || "",
              description_fr: rest.descriptionFr || "",
              description_ar: rest.descriptionAr || "",
            });
            if (error) throw error;
            return { success: true };
          }
          // ── ORDERS ──
          case "updateOrderStatus": {
            const res = await fetch(SUPABASE_URL + "/functions/v1/update-order-status", {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": "Bearer " + SUPABASE_ANON_KEY },
              body: JSON.stringify({ id, status: rest.status }),
            });
            return res.json();
          }
          case "deleteOrder": {
            const { error } = await sb.from("orders").delete().eq("id", id);
            if (error) throw error;
            return { success: true };
          }
          // ── SETTINGS ──
          case "updateSettings": {
            if (rest.updates) {
              const upserts = Object.entries(rest.updates).map(([key, value]) => ({ key, value: String(value) }));
              const { error } = await sb.from("settings").upsert(upserts, { onConflict: "key" });
              if (error) throw error;
            }
            return { success: true };
          }
          default:
            return { success: false, error: "Unknown action: " + action };
        }
      }
      // Apply a getInitialData-shaped response to the in-memory state and re-render
      function applyInitialData(res, settingsRes) {
        if (!res) return;
        if (Array.isArray(res.products)) { products = res.products; productsTotal = products.length; }
        if (Array.isArray(res.categories)) categories = res.categories;
        if (Array.isArray(res.subCategories)) subCategories = res.subCategories;
        if (Array.isArray(res.subSubCategories)) subSubCategories = res.subSubCategories;
        if (Array.isArray(res.deliveryPrices)) deliveryPrices = res.deliveryPrices;
        // orders are fetched separately via _fetchOrdersPage() / _fetchDashOrders()
        if (res.bundle && res.bundle.bundleId) {
          // mirror loadBundle() side effects without a network call
          window._cachedBundle = res.bundle;
        }
        if (settingsRes && settingsRes.success && settingsRes.settings) {
          settings = settingsRes.settings;
          var u = document.getElementById("set-username");
          var d = document.getElementById("set-displayname");
          if (u) u.value = settings.admin_username || "";
          if (d) d.value = settings.admin_displayname || "";
          var name = settings.admin_displayname || settings.admin_username || "Admin";
          var sb = document.getElementById("sb-username");
          if (sb) sb.textContent = name;
          var av = document.querySelector(".sb-avatar");
          if (av) av.textContent = name[0].toUpperCase();
          // Free delivery settings
          var thr = document.getElementById("free-delivery-threshold");
          var afd = document.getElementById("all-free-delivery");
          if (thr) thr.value = settings.free_delivery_threshold || "";
          if (afd) {
            afd.checked = settings.all_free_delivery === "true";
            var afdLabel = document.getElementById("afd-label");
            if (afdLabel) afdLabel.textContent = afd.checked ? "Enabled" : "Disabled";
          }
          // Announcement bar settings
          var annEnabled = document.getElementById("ann-enabled");
          if (annEnabled) {
            annEnabled.checked = settings.announcement_enabled === "true";
            var annLabel = document.getElementById("ann-enabled-label");
            if (annLabel) annLabel.textContent = annEnabled.checked ? t('common.enabled') : t('common.disabled');
          }
          var annFields = {
            "ann-text-en": "announcement_text_en",
            "ann-text-fr": "announcement_text_fr",
            "ann-text-ar": "announcement_text_ar",
            "ann-link-text-en": "announcement_link_text_en",
            "ann-link-text-fr": "announcement_link_text_fr",
            "ann-link-text-ar": "announcement_link_text_ar",
            "ann-link-url": "announcement_link_url",
          };
          Object.keys(annFields).forEach(function (elId) {
            var el = document.getElementById(elId);
            if (el) el.value = settings[annFields[elId]] || "";
          });
        }
        renderCats();
        renderProducts();
        renderDelivery();
        renderBundleList(document.getElementById("bundle-search")?.value || "");
        if (typeof renderBundleSelected === "function" && window._cachedBundle) {
          try { renderBundleSelected(window._cachedBundle); } catch (e) {}
        }
      }
      function showLoading(msg = "Loading…") {
        document.getElementById("loading-text").textContent = msg;
        document.getElementById("loading-overlay").classList.add("show");
      }
      function hideLoading() {
        document.getElementById("loading-overlay").classList.remove("show");
      }

      // ════════════════════════════════════════════
      // REAL-TIME POLLING (silent — no spinner)
      // ════════════════════════════════════════════
      function updateLastUpdated() {
        const el = document.getElementById("last-updated");
        if (el) el.textContent = "Updated " + new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      }

      // ════════════════════════════════════════════
      // NOTIFICATIONS — live "new order" alerts via Supabase Realtime
      // ════════════════════════════════════════════
      const NOTIF_KEY = "bb_admin_notifs";
      let notifs = [];
      let notifPanelOpen = false;

      function _loadNotifs() {
        try { notifs = JSON.parse(localStorage.getItem(NOTIF_KEY)) || []; } catch (e) { notifs = []; }
      }
      function _saveNotifs() {
        notifs = notifs.slice(0, 30);
        localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));
      }
      function _timeAgo(iso) {
        const diff = Math.max(0, Date.now() - new Date(iso).getTime());
        const min = Math.floor(diff / 60000);
        if (min < 1) return t('notif.justNow');
        if (min < 60) return min + t('notif.minAgo');
        const hr = Math.floor(min / 60);
        if (hr < 24) return hr + t('notif.hourAgo');
        return Math.floor(hr / 24) + t('notif.dayAgo');
      }
      function renderNotifBadge() {
        const unread = notifs.filter((n) => !n.read).length;
        const badge = document.getElementById("tb-notif-badge");
        const btn = document.querySelector(".tb-notif-btn");
        if (badge) {
          badge.textContent = unread > 9 ? "9+" : String(unread);
          badge.style.display = unread > 0 ? "flex" : "none";
        }
        if (btn) btn.classList.toggle("has-unread", unread > 0);
      }
      function renderNotifList() {
        const list = document.getElementById("tb-notif-list");
        if (!list) return;
        if (!notifs.length) {
          list.innerHTML = `<div class="tb-notif-empty">${t('notif.empty')}</div>`;
          return;
        }
        list.innerHTML = notifs
          .map(
            (n, i) => `
          <div class="tb-notif-item${n.read ? "" : " unread"}" onclick="openNotif(${i})">
            <div class="tb-notif-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/>
              </svg>
            </div>
            <div class="tb-notif-body">
              <div class="tb-notif-title">${t('notif.newOrder')}</div>
              <div class="tb-notif-meta">${n.name} · ${Number(n.total || 0).toLocaleString("fr-DZ")} DA${n.wilaya ? " · " + n.wilaya : ""}</div>
            </div>
            <div class="tb-notif-time">${_timeAgo(n.createdAt)}</div>
          </div>`,
          )
          .join("");
      }
      function pushNotif(order) {
        notifs.unshift({
          id: order.id,
          name: [order.first_name, order.last_name].filter(Boolean).join(" ") || "—",
          total: order.total || 0,
          wilaya: order.wilaya || "",
          createdAt: order.created_at || new Date().toISOString(),
          read: false,
        });
        _saveNotifs();
        renderNotifBadge();
        renderNotifList();
      }
      function toggleNotifPanel(e) {
        if (e) e.stopPropagation();
        notifPanelOpen = !notifPanelOpen;
        const panel = document.getElementById("tb-notif-panel");
        if (panel) panel.classList.toggle("open", notifPanelOpen);
        if (notifPanelOpen) {
          notifs.forEach((n) => (n.read = true));
          _saveNotifs();
          renderNotifBadge();
          renderNotifList();
        }
      }
      function openNotif(idx) {
        toggleNotifPanel();
        showPage("orders", document.querySelector(".sb-link[onclick*=orders]"));
        const n = notifs[idx];
        if (n && n.name && n.name !== "—") {
          const search = document.getElementById("orders-search");
          if (search) { search.value = n.name; searchOrders(n.name); }
        }
      }
      function clearAllNotifs(e) {
        if (e) e.stopPropagation();
        notifs = [];
        _saveNotifs();
        renderNotifBadge();
        renderNotifList();
      }
      document.addEventListener("click", (e) => {
        if (notifPanelOpen && !e.target.closest(".tb-notif-wrap")) toggleNotifPanel();
      });

      function _playNotifPing() {
        try {
          const Ctx = window.AudioContext || window.webkitAudioContext;
          if (!Ctx) return;
          const ctx = new Ctx();
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.type = "sine";
          o.frequency.value = 880;
          g.gain.setValueAtTime(0.0001, ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.16, ctx.currentTime + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
          o.start();
          o.stop(ctx.currentTime + 0.55);
        } catch (e) {}
      }

      function _subscribeOrderNotifications() {
        if (!sb || !sb.channel) return;
        sb.channel("admin-orders-notify")
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "orders" },
            (payload) => {
              const row = payload.new || {};
              pushNotif(row);
              _playNotifPing();
              const btn = document.querySelector(".tb-notif-btn");
              if (btn) {
                btn.classList.remove("ring");
                void btn.offsetWidth;
                btn.classList.add("ring");
              }
              const name = [row.first_name, row.last_name].filter(Boolean).join(" ");
              showToast(`${t("notif.newOrder")} — ${name}`);
              Promise.all([_fetchDashOrders(), _fetchOrdersPage()]).then(() => {
                renderOrders();
                updateDashboard();
                updateLastUpdated();
              });
            },
          )
          .subscribe();
      }

      // ════════════════════════════════════════════
      // INIT
      // ════════════════════════════════════════════
      document.addEventListener("DOMContentLoaded", async () => {
        // Sync lang button state
        (function() {
          _applyLangDir(adminLang);
          document.querySelectorAll(".tb-lang-btn").forEach(b => b.classList.remove("active"));
          const btn = document.getElementById("lang-btn-" + adminLang);
          if (btn) btn.classList.add("active");
          applyAdminI18n();
        })();
        _loadNotifs();
        renderNotifBadge();
        renderNotifList();
        _subscribeOrderNotifications();
        let cached = false;
        if (!SUPABASE_URL || !sb) {
          showToast("Supabase not configured!", "error");
          return;
        }
        showLoading("Loading dashboard…");
        // Fetch fresh data from Supabase
        try {
          const _timeout = new Promise((_, rej) => setTimeout(() => rej(new Error("Load timeout — check your connection")), 20000));
          const [initRes, settingsRes, bundleRes] = await Promise.race([
            Promise.all([apiGet("getInitialData"), apiGet("getSettings"), apiGet("getBundle")]),
            _timeout,
          ]);
          if (initRes && initRes.success) {
            applyInitialData(initRes, settingsRes);
            if (bundleRes && bundleRes.success) {
              if (bundleRes.bundleId) {
                bundleSelectedId = bundleRes.bundleId;
                const p = products.find((x) => x.id === bundleRes.bundleId);
                const lbl = document.getElementById("bundle-selected-label");
                if (lbl) lbl.innerHTML = p
                  ? `Selected: <strong>${p.name}</strong>`
                  : `Selected: <strong>${bundleRes.bundleId}</strong>`;
              }
              const bundleFields = {
                "bundle-title-en":       bundleRes.titleEn,
                "bundle-title-fr":       bundleRes.titleFr,
                "bundle-title-ar":       bundleRes.titleAr,
                "bundle-description-en": bundleRes.descriptionEn,
                "bundle-description-fr": bundleRes.descriptionFr,
                "bundle-description-ar": bundleRes.descriptionAr,
              };
              Object.entries(bundleFields).forEach(([id, val]) => {
                const el = document.getElementById(id);
                if (el && val) el.value = val;
              });
              renderBundleList(document.getElementById("bundle-search")?.value || "");
            }
            await Promise.all([_fetchDashOrders(), _fetchOrdersPage()]);
            renderOrders();
            updateDashboard();
            updateLastUpdated();
          } else if (!cached) {
            showToast("Failed to load data", "error");
          }
        } catch (e) {
          if (!cached) showToast("Failed to load: " + e.message, "error");
        } finally {
          hideLoading();
        }
      });

      async function loadSubCategories() {
        const r = await apiGet("getSubCategories");
        if (r.success) subCategories = r.subCategories;
      }
      async function loadSubSubCategories() {
        const r = await apiGet("getSubSubCategories");
        if (r.success) subSubCategories = r.subSubCategories;
      }
      async function loadCategories() {
        const [catRes, subRes, subSubRes] = await Promise.all([
          apiGet("getCategories"),
          apiGet("getSubCategories"),
          apiGet("getSubSubCategories"),
        ]);
        if (catRes.success) categories = catRes.categories;
        if (subRes.success) subCategories = subRes.subCategories;
        if (subSubRes.success) subSubCategories = subSubRes.subSubCategories;
        renderCats();
      }
      async function loadProducts() {
        const r = await apiGet("getProducts");
        if (r.success) {
          products = r.products;
          renderProducts();
          renderBundleList(document.getElementById("bundle-search")?.value || "");
        }
      }
      async function loadDeliveryPrices() {
        const r = await apiGet("getDeliveryPrices");
        if (r.success) {
          deliveryPrices = r.deliveryPrices;
          renderDelivery();
        }
      }
      async function loadSettings() {
        const r = await apiGet("getSettings");
        if (r.success) {
          settings = r.settings;
          document.getElementById("set-username").value =
            settings.admin_username || "";
          document.getElementById("set-displayname").value =
            settings.admin_displayname || "";
          const name =
            settings.admin_displayname || settings.admin_username || "Admin";
          document.getElementById("sb-username").textContent = name;
          document.querySelector(".sb-avatar").textContent =
            name[0].toUpperCase();
        }
      }
      function fmtRevenue(n) {
        if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
        if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
        return Math.round(n).toLocaleString("fr-DZ");
      }

      function updateDashboard() {
        document.getElementById("stat-products").textContent = productsTotal || products.length;
        document.getElementById("stat-orders").textContent = _dashOrders.length;

        const now = new Date();
        const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
        const weekOrders = _dashOrders.filter((o) => {
          if (!o.createdAt) return false;
          try { return new Date(o.createdAt) >= weekAgo; } catch (e) { return false; }
        });

        document.getElementById("stat-week-orders").textContent = weekOrders.length;
        document.getElementById("stat-pending").textContent = _dashOrders.filter((o) => o.status === "waiting").length;

        const totalRev = _dashOrders.reduce((s, o) => s + (Number(o.total) || 0), 0);
        const weekRev = weekOrders.reduce((s, o) => s + (Number(o.total) || 0), 0);
        document.getElementById("stat-revenue-total").textContent = fmtRevenue(totalRev);
        document.getElementById("stat-revenue-week").textContent = fmtRevenue(weekRev);

        const trendEl = document.getElementById("stat-week-trend");
        if (trendEl) {
          const prevWeekOrders = _dashOrders.filter((o) => {
            if (!o.createdAt) return false;
            try {
              const d = new Date(o.createdAt);
              return d >= new Date(now - 14 * 24 * 60 * 60 * 1000) && d < weekAgo;
            } catch (e) { return false; }
          });
          if (prevWeekOrders.length > 0) {
            const diff = weekOrders.length - prevWeekOrders.length;
            trendEl.textContent = diff >= 0 ? `↑ ${diff} vs last week` : `↓ ${Math.abs(diff)} vs last week`;
            trendEl.className = "stat-trend " + (diff >= 0 ? "up" : "neutral");
          } else {
            trendEl.textContent = "";
          }
        }

        // Top products from order items
        const productQty = {};
        _dashOrders.forEach((o) => {
          (o.items || []).forEach((it) => {
            const name = (it.name || "Unknown").split(" (")[0].trim();
            productQty[name] = (productQty[name] || 0) + (Number(it.qty) || 1);
          });
        });
        const topList = Object.entries(productQty)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 7);
        const maxQty = topList.length ? topList[0][1] : 1;
        const rankClass = ["gold", "silver", "bronze"];
        const topEl = document.getElementById("top-products-list");
        if (topEl) {
          topEl.innerHTML = topList.length
            ? topList.map(([name, qty], i) => `
                <div class="top-product-item">
                  <div class="top-product-rank ${rankClass[i] || ""}">${i + 1}</div>
                  <div class="top-product-name" title="${name}">${name}</div>
                  <div class="top-product-bar-wrap"><div class="top-product-bar-fill" style="width:${Math.round((qty/maxQty)*100)}%"></div></div>
                  <div class="top-product-qty">${qty} sold</div>
                </div>`).join("")
            : `<div style="padding:24px;text-align:center;color:var(--g400);font-size:13px">${t('common.noData')}</div>`;
        }

        // Recent orders (last 6)
        const recentEl = document.getElementById("recent-orders-list");
        if (recentEl) {
          const recent = _dashOrders.slice(0, 6);
          recentEl.innerHTML = recent.length
            ? recent.map((o) => {
                const name = `${o.firstName} ${o.lastName}`.trim() || "—";
                const badge = `<span class="badge ${getOrderBadgeClass(o.status)}" style="font-size:10px;padding:2px 8px">${cap(o.status)}</span>`;
                let date = "—";
                if (o.createdAt) try { date = new Date(o.createdAt).toLocaleDateString("en-GB"); } catch (e) {}
                return `<div class="recent-order-row" onclick="showPage('orders',document.querySelector('.sb-link[onclick*=orders]'));setTimeout(()=>openOrderDetail('${o.id}'),100)">
                  <div class="recent-order-name">${name}<div class="recent-order-meta">${date} · ${(o.items||[]).length} item${(o.items||[]).length!==1?'s':''}</div></div>
                  ${badge}
                  <div class="recent-order-total">${Number(o.total||0).toLocaleString("fr-DZ")} DA</div>
                </div>`;
              }).join("")
            : `<div style="padding:24px;text-align:center;color:var(--g400);font-size:13px">${t('orders.empty')}</div>`;
        }

        // Status overview bar
        const total = _dashOrders.length || 1;
        const statuses = ["waiting","confirmed","delivered","canceled"];
        const counts = {};
        statuses.forEach(s => { counts[s] = _dashOrders.filter(o => o.status === s).length; });
        const barEl = document.getElementById("status-ov-bar");
        if (barEl) {
          barEl.innerHTML = statuses
            .filter(s => counts[s] > 0)
            .map(s => `<div class="ov-seg ov-seg-${s}" style="width:${(counts[s]/total*100).toFixed(1)}%" title="${cap(s)}: ${counts[s]}"></div>`)
            .join("") || `<div class="ov-seg ov-seg-waiting" style="width:100%;opacity:0.2"></div>`;
        }
        const legendEl = document.getElementById("status-ov-legend");
        if (legendEl) {
          const dotColor = { waiting: "var(--orange)", confirmed: "var(--green)", delivered: "var(--blue)", canceled: "#dc2626" };
          legendEl.innerHTML = statuses.map(s => `
            <div class="status-ov-item">
              <div class="status-ov-dot" style="background:${dotColor[s]}"></div>
              <span>${cap(s)}</span>
              <strong>${counts[s]}</strong>
              <span style="color:var(--g400)">(${total > 0 ? (counts[s]/total*100).toFixed(0) : 0}%)</span>
            </div>`).join("");
        }
      }

      // ════════════════════════════════════════════
      // SIDEBAR & NAV
      // ════════════════════════════════════════════
      function toggleSidebar() {
        if (window.innerWidth < 768) {
          const isOpen = document.getElementById("sidebar").classList.toggle("mobile-open");
          document.getElementById("sb-overlay").classList.toggle("show", isOpen);
        } else {
          sidebarCollapsed = !sidebarCollapsed;
          document.getElementById("sidebar").classList.toggle("collapsed", sidebarCollapsed);
          document.getElementById("main").classList.toggle("full", sidebarCollapsed);
        }
      }
      function closeSidebar() {
        document.getElementById("sidebar").classList.remove("mobile-open");
        document.getElementById("sb-overlay").classList.remove("show");
      }
      const pageNames = {
        dashboard: () => t('page.dashboard'),
        products: () => t('page.products'),
        categories: () => t('page.categories'),
        delivery: () => t('page.delivery'),
        bundle: () => t('page.bundle'),
        announcement: () => t('page.announcement'),
        orders: () => t('page.orders'),
        stock: () => t('page.stock'),
        settings: () => t('page.settings'),
      };
      function showPage(name, el) {
        document
          .querySelectorAll(".page")
          .forEach((p) => p.classList.remove("active"));
        document.getElementById("page-" + name).classList.add("active");
        document
          .querySelectorAll(".sb-link")
          .forEach((l) => l.classList.remove("active"));
        if (el) el.classList.add("active");
        document.getElementById("page-title").textContent =
          (typeof pageNames[name] === 'function' ? pageNames[name]() : pageNames[name]) || name;
        if (name === "orders") { /* badge cleared on view */ }
        if (name === "stock") renderStock();
        if (name === "settings") loadAdminUsers();
        if (window.innerWidth < 768) closeSidebar();
      }
      function doLogout() {
        sb.auth.signOut();
        sessionStorage.removeItem("bb_admin_auth");
        sessionStorage.removeItem("bb_admin_name");
        window.location.href = "/mgmt9kx";
      }

      // ════════════════════════════════════════════
      // STOCK MANAGEMENT
      // ════════════════════════════════════════════
      function renderStock() {
        var list = document.getElementById("stock-list");
        var summary = document.getElementById("stock-summary");
        if (!list) return;
        var search = (document.getElementById("stock-search")?.value || "").toLowerCase().trim();
        var filter = document.getElementById("stock-filter")?.value || "all";

        var filtered = products.filter(function(p) {
          var name = (p.nameEn || p.name || "").toLowerCase();
          var brand = (p.brandEn || p.brand || "").toLowerCase();
          if (search && !name.includes(search) && !brand.includes(search)) return false;
          var s = Number(p.stock) || 0;
          if (filter === "out") return s === 0;
          if (filter === "low") return s > 0 && s <= 5;
          return true;
        });

        var outCount = products.filter(function(p) { return (Number(p.stock) || 0) === 0; }).length;
        var lowCount = products.filter(function(p) { var s = Number(p.stock) || 0; return s > 0 && s <= 5; }).length;
        if (summary) summary.textContent = filtered.length + " product" + (filtered.length !== 1 ? "s" : "") + " · " + outCount + " out · " + lowCount + " low";

        if (!filtered.length) {
          list.innerHTML = `<div style="padding:48px;text-align:center;color:var(--g400);font-size:13px">${t('common.noData')}</div>`;
          return;
        }

        list.innerHTML = filtered.map(function(p) {
          var totalStock = Number(p.stock) || 0;
          var isOut = totalStock === 0;
          var isLow = !isOut && totalStock <= 5;
          var imgSrc = Array.isArray(p.imageUrl) ? p.imageUrl[0] : p.imageUrl;
          var hasVariants = Array.isArray(p.variants) && p.variants.length > 0;

          var badgeCls = isOut ? "stock-badge-out" : isLow ? "stock-badge-low" : "stock-badge-ok";
          var badgeText = isOut ? "Out of Stock" : String(totalStock);

          var controls = "";
          if (hasVariants) {
            controls = '<div class="stock-variants">' +
              p.variants.map(function(v, vi) {
                var label = v.labelEn || v.label || (v.weight ? v.weight + (v.unit || "") : "") || ("Option " + (vi + 1));
                var vStock = Number(v.stock) || 0;
                var vOut = vStock === 0;
                return '<div class="stock-variant-row' + (vOut ? " stock-variant-out" : "") + '">' +
                  '<span class="stock-variant-label">' + _esc(label) + '</span>' +
                  '<input type="number" class="stock-input" data-pid="' + p.id + '" data-vi="' + vi + '" value="' + vStock + '" min="0" oninput="stockInputChanged(\'' + p.id + '\')" />' +
                  (vOut ? '<span class="stock-v-zero">0</span>' : '') +
                '</div>';
              }).join("") +
            "</div>";
          } else {
            controls = '<input type="number" class="stock-input stock-input-solo" data-pid="' + p.id + '" value="' + (Number(p.stock) || 0) + '" min="0" oninput="stockInputChanged(\'' + p.id + '\')" />';
          }

          return '<div class="stock-row' + (isOut ? " stock-row-out" : isLow ? " stock-row-low" : "") + '" id="stock-row-' + p.id + '">' +
            '<div class="stock-row-main">' +
              '<div class="stock-row-left">' +
                (imgSrc ? '<img src="' + imgSrc + '" class="stock-thumb" alt="" />' : '<div class="stock-thumb stock-thumb-empty"></div>') +
                '<div class="stock-info">' +
                  '<div class="stock-name">' + _esc(p.nameEn || p.name || "Unnamed") + '</div>' +
                  (p.brandEn || p.brand ? '<div class="stock-brand">' + _esc(p.brandEn || p.brand) + '</div>' : '') +
                  '<div class="stock-total-badge ' + badgeCls + '" id="stock-badge-' + p.id + '">' + badgeText + '</div>' +
                '</div>' +
              '</div>' +
              '<div class="stock-row-actions">' +
                '<button class="stock-save-btn" id="stock-save-' + p.id + '" onclick="saveStockRow(\'' + p.id + '\')" disabled>Save</button>' +
              '</div>' +
            '</div>' +
            '<div class="stock-controls">' + controls + '</div>' +
          '</div>';
        }).join("");
      }

      function _esc(s) {
        return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
      }

      function stockInputChanged(pid) {
        var btn = document.getElementById("stock-save-" + pid);
        if (btn) btn.disabled = false;
        var row = document.getElementById("stock-row-" + pid);
        if (!row) return;
        var inputs = row.querySelectorAll(".stock-input");
        var total = 0;
        inputs.forEach(function(inp) { total += parseInt(inp.value) || 0; });
        var badge = document.getElementById("stock-badge-" + pid);
        if (badge) {
          var isOut = total === 0;
          var isLow = !isOut && total <= 5;
          badge.className = "stock-total-badge " + (isOut ? "stock-badge-out" : isLow ? "stock-badge-low" : "stock-badge-ok");
          badge.textContent = isOut ? "Out of Stock" : String(total);
          row.classList.toggle("stock-row-out", isOut);
          row.classList.toggle("stock-row-low", isLow && !isOut);
        }
        // Update variant zero highlight
        row.querySelectorAll(".stock-input[data-vi]").forEach(function(inp) {
          var vRow = inp.closest(".stock-variant-row");
          if (vRow) vRow.classList.toggle("stock-variant-out", (parseInt(inp.value) || 0) === 0);
        });
      }

      async function saveStockRow(pid) {
        var p = products.find(function(x) { return x.id === pid; });
        if (!p) return;
        var btn = document.getElementById("stock-save-" + pid);
        var origText = btn ? btn.textContent : "Save";
        if (btn) { btn.disabled = true; btn.textContent = "Saving…"; }
        try {
          var row = document.getElementById("stock-row-" + pid);
          var updateData = {};
          if (Array.isArray(p.variants) && p.variants.length > 0) {
            var newVariants = p.variants.map(function(v, vi) {
              var inp = row.querySelector('.stock-input[data-vi="' + vi + '"]');
              return Object.assign({}, v, { stock: parseInt(inp ? inp.value : 0) || 0 });
            });
            var globalStock = newVariants.reduce(function(s, v) { return s + (Number(v.stock) || 0); }, 0);
            updateData = { variants: newVariants, stock: globalStock };
            p.variants = newVariants;
            p.stock = globalStock;
          } else {
            var inp = row.querySelector(".stock-input");
            var newStock = parseInt(inp ? inp.value : 0) || 0;
            updateData = { stock: newStock };
            p.stock = newStock;
          }
          var res = await sb.from("products").update(updateData).eq("id", pid);
          if (res.error) throw res.error;
          if (btn) { btn.textContent = "Saved ✓"; btn.style.background = "var(--green,#22c55e)"; }
          setTimeout(function() {
            if (btn) { btn.textContent = "Save"; btn.style.background = ""; btn.disabled = true; }
          }, 2200);
        } catch (err) {
          alert("Error: " + (err.message || err));
          if (btn) { btn.disabled = false; btn.textContent = origText; }
        }
      }

      // ════════════════════════════════════════════
      // CLOUDINARY
      // ════════════════════════════════════════════
      function renderImageGrid() {
        const grid = document.getElementById("images-grid");
        if (!grid) return;
        grid.innerHTML = "";
        currentImageUrls.forEach((url, idx) => {
          const wrap = document.createElement("div");
          wrap.className = "img-thumb-wrap";
          wrap.innerHTML = `<img src="${url}" /><span class="img-thumb-remove" onclick="removeImage(${idx})">×</span>`;
          grid.appendChild(wrap);
        });
        const addBtn = document.createElement("div");
        addBtn.className = "upload-box-add";
        addBtn.innerHTML = `<input type="file" accept="image/*" onchange="handleImageUpload(event)" /><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
        grid.appendChild(addBtn);
      }

      function removeImage(idx) {
        currentImageUrls.splice(idx, 1);
        renderImageGrid();
      }

      async function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        e.target.value = "";
        document.getElementById("upload-spinner").style.display = "block";
        try {
          const fd = new FormData();
          fd.append("file", file);
          fd.append("upload_preset", CLOUDINARY_PRESET);
          fd.append("folder", "bybens-products");
          const res = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
            { method: "POST", body: fd },
          );
          const data = await res.json();
          if (data.secure_url) {
            currentImageUrls.push(data.secure_url);
            renderImageGrid();
            showToast("Image uploaded!");
          } else
            showToast(
              "Upload failed: " + (data.error?.message || "Unknown"),
              "error",
            );
        } catch (err) {
          showToast("Upload error: " + err.message, "error");
        }
        document.getElementById("upload-spinner").style.display = "none";
      }

      // ════════════════════════════════════════════
      // CHECKBOX HELPERS (FIXED — no double-toggle)
      // ════════════════════════════════════════════
      function buildCheckboxGroup(
        containerId,
        items,
        selectedIds = [],
        onChangeFn = null,
      ) {
        const container = document.getElementById(containerId);
        if (!items.length) {
          container.innerHTML =
            '<span style="font-size:12px;color:var(--g400)">None available</span>';
          return;
        }
        container.innerHTML = items
          .map((item) => {
            const checked = selectedIds.includes(item.id);
            return `<div class="checkbox-item ${checked ? "checked" : ""}" data-value="${item.id}" onclick="handleCheckboxClick(this${onChangeFn ? ",'" + onChangeFn + "'" : ""})">
          <input type="checkbox" value="${item.id}" ${checked ? "checked" : ""} />
          ${item.label || item.name || item.code}
        </div>`;
          })
          .join("");
      }

      function handleCheckboxClick(el, callbackName) {
        const cb = el.querySelector('input[type="checkbox"]');
        cb.checked = !cb.checked;
        el.classList.toggle("checked", cb.checked);
        if (callbackName && window[callbackName]) window[callbackName]();
      }

      function getCheckedValues(containerId) {
        return Array.from(
          document.querySelectorAll(
            `#${containerId} input[type="checkbox"]:checked`,
          ),
        ).map((cb) => cb.value);
      }

      // ════════════════════════════════════════════
      // PRODUCTS
      // ════════════════════════════════════════════
      function filterProducts(q = "") {
        productPage = 1;
        _prodFilter = q.toLowerCase();
        renderProducts(_prodFilter);
      }

      function renderProducts(filter = "") {
        _selReset("product");
        const tbody = document.getElementById("products-tbody");
        const pag = document.getElementById("products-pag");
        const filtered = products.filter(
          (p) =>
            !filter ||
            (p.nameEn || p.name || "").toLowerCase().includes(filter) ||
            (p.nameFr || "").toLowerCase().includes(filter) ||
            (p.brandEn || p.brand || "").toLowerCase().includes(filter) ||
            (p.brandFr || "").toLowerCase().includes(filter),
        );
        if (!filtered.length) {
          tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state"><p>${t('products.empty')}</p></div></td></tr>`;
          if (pag) pag.innerHTML = "";
          return;
        }
        const pageItems = filtered.slice((productPage - 1) * _PAGE, productPage * _PAGE);
        tbody.innerHTML = pageItems
          .map((p) => {
            const catNames = (p.categoryIds || [])
              .map((id) => {
                const c = categories.find((x) => x.id === id);
                return c ? _pLang(c) : "";
              })
              .filter(Boolean)
              .join(", ");
            const subNames = (p.subCategoryIds || [])
              .map((id) => {
                const s = subCategories.find((x) => x.id === id);
                return s ? _pLang(s) : "";
              })
              .filter(Boolean)
              .join(", ");
            const flavorStr = (p.flavors || []).map((f) => f.name).join(", ");
            const variantStr = (p.variants || [])
              .map((v) => {
                const lbl = v.label || (v.weight ? `${v.weight}${v.unit || ''}` : '');
                return lbl ? `${lbl} — ${Number(v.price).toLocaleString()} DA` : '';
              })
              .filter(Boolean)
              .join("<br>");
            const _firstImg = Array.isArray(p.imageUrl) ? p.imageUrl[0] : p.imageUrl;
            const imgHtml = _firstImg
              ? `<img src="${_firstImg}" alt="" />`
              : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>`;
            return `<tr>
          <td class="cb-td"><input type="checkbox" class="row-cb" data-sel-type="product" data-sel-id="${p.id}" onchange="_selToggle('product','${p.id}',this.checked)"></td>
          <td><div class="prod-info"><div class="prod-thumb">${imgHtml}</div><div class="prod-name-block"><div class="name">${_pLang(p)}</div><div class="sub">${_bLang(p)}</div></div></div></td>
          <td><span style="font-size:12px">${catNames}${subNames ? '<br><span style="color:var(--g400)">' + subNames + "</span>" : ""}</span></td>
          <td style="font-size:12px;color:var(--g600)">${flavorStr || "—"}</td>
          <td style="font-size:12px">${variantStr || "—"}</td>
          <td>${p.stock}</td>
          <td><span class="badge badge-${p.status}">${cap(p.status)}</span>${p.hidden ? '<span class="badge" style="margin-left:4px;background:#f3f4f6;color:#6b7280;border:1px solid #e5e7eb">Hidden</span>' : ''}</td>
          <td><div class="action-group"><button class="act-btn act-edit" onclick="editProduct('${p.id}')">Edit</button><button class="act-btn ${p.hidden ? 'act-confirm' : ''}" style="gap:4px" onclick="toggleProductVisibility('${p.id}',${p.hidden})">${p.hidden ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>Show' : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>Hide'}</button><button class="act-btn act-delete" onclick="confirmDelete('product','${p.id}')">Delete</button></div></td>
        </tr>`;
          })
          .join("");
        if (pag) pag.innerHTML = _pagCtrl(filtered.length, productPage, "setProductPage");
      }

      function refreshSubCatCheckboxes() {
        const selectedCatIds = getCheckedValues("pm-categories");
        const filteredSubs = subCategories.filter((s) =>
          s.categoryIds.some((cid) => selectedCatIds.includes(cid)),
        );
        // Preserve currently checked subs that are still valid
        const currentSubIds = getCheckedValues("pm-subcategories");
        const validSubIds = currentSubIds.filter((id) =>
          filteredSubs.some((s) => s.id === id),
        );
        buildCheckboxGroup("pm-subcategories", filteredSubs.map(s => Object.assign({}, s, { label: _pLang(s) })), validSubIds, "refreshSubSubCatCheckboxes");
        refreshSubSubCatCheckboxes();
      }

      function refreshSubSubCatCheckboxes() {
        const selectedSubIds = getCheckedValues("pm-subcategories");
        const filteredSubSubs = subSubCategories.filter((ss) =>
          (ss.subCategoryIds || []).some((sid) => selectedSubIds.includes(sid)),
        );
        const currentSubSubIds = getCheckedValues("pm-subsubcategories");
        const validSubSubIds = currentSubSubIds.filter((id) =>
          filteredSubSubs.some((ss) => ss.id === id),
        );
        buildCheckboxGroup("pm-subsubcategories", filteredSubSubs.map(ss => Object.assign({}, ss, { label: _pLang(ss) })), validSubSubIds);
      }

      function openProductModal(id = null) {
        editingProductId = id;
        currentImageUrls = [];
        document.getElementById("pm-title").textContent = id
          ? t('pm.editTitle')
          : t('pm.addTitle');
        document.getElementById("variants-list").innerHTML = "";
        document.getElementById("flavors-list").innerHTML = "";
        renderImageGrid();

        if (id) {
          const p = products.find((x) => x.id === id);
          if (p) {
            document.getElementById("pm-name-en").value = p.nameEn || p.name || "";
            document.getElementById("pm-name-fr").value = p.nameFr || "";
            document.getElementById("pm-name-ar").value = p.nameAr || "";
            document.getElementById("pm-brand-en").value = p.brandEn || p.brand || "";
            document.getElementById("pm-brand-fr").value = p.brandFr || "";
            document.getElementById("pm-brand-ar").value = p.brandAr || "";
            document.getElementById("pm-desc-en").innerHTML = p.descriptionEn || p.description || "";
            document.getElementById("pm-desc-fr").innerHTML = p.descriptionFr || "";
            document.getElementById("pm-desc-ar").innerHTML = p.descriptionAr || "";
            switchDescTab("en");
            document.getElementById("pm-stock").value = p.stock;
            document.getElementById("pm-discount").value = p.discount;
            document.getElementById("pm-status").value = p.status;
            const fdEl = document.getElementById("pm-free-delivery");
            if (fdEl) fdEl.checked = p.freeDelivery || false;
            currentImageUrls = Array.isArray(p.imageUrl) ? [...p.imageUrl] : (p.imageUrl ? [p.imageUrl] : []);
            renderImageGrid();
            buildCheckboxGroup(
              "pm-categories",
              categories.map(c => Object.assign({}, c, { label: _pLang(c) })),
              p.categoryIds || [],
              "refreshSubCatCheckboxes",
            );
            setTimeout(() => {
              const selectedCatIds = p.categoryIds || [];
              const filteredSubs = subCategories.filter((s) =>
                s.categoryIds.some((cid) => selectedCatIds.includes(cid)),
              );
              buildCheckboxGroup(
                "pm-subcategories",
                filteredSubs.map(s => Object.assign({}, s, { label: _pLang(s) })),
                p.subCategoryIds || [],
                "refreshSubSubCatCheckboxes",
              );
              const selectedSubIds = p.subCategoryIds || [];
              const filteredSubSubs = subSubCategories.filter((ss) =>
                (ss.subCategoryIds || []).some((sid) => selectedSubIds.includes(sid)),
              );
              buildCheckboxGroup(
                "pm-subsubcategories",
                filteredSubSubs.map(ss => Object.assign({}, ss, { label: _pLang(ss) })),
                p.subSubCategoryIds || [],
              );
            }, 30);
            document.getElementById("variants-list").innerHTML = "";
            document.getElementById("flavors-list").innerHTML = "";
            const anyCustomVariant = (p.variants || []).some((v) => !v.sizeMode);
            document.getElementById("pm-custom-variants").checked = anyCustomVariant;
            (p.variants || []).forEach((v) => addVariant(v));
            (p.flavors || []).forEach((f) => addFlavor(f));
            refreshStockMatrix();
          }
        } else {
          document.getElementById("pm-custom-variants").checked = false;
          ["pm-name-en", "pm-name-fr", "pm-name-ar", "pm-brand-en", "pm-brand-fr", "pm-brand-ar", "pm-stock", "pm-discount"].forEach(
            (x) => (document.getElementById(x).value = ""),
          );
          document.getElementById("pm-desc-en").innerHTML = "";
          document.getElementById("pm-desc-fr").innerHTML = "";
          document.getElementById("pm-desc-ar").innerHTML = "";
          switchDescTab("en");
          document.getElementById("variants-list").innerHTML = "";
          document.getElementById("flavors-list").innerHTML = "";
          document.getElementById("stock-matrix-section").style.display = "none";
          document.getElementById("variant-stock-section").style.display = "none";
          document.getElementById("pm-stock").readOnly = false;
          document.getElementById("pm-stock-hint").style.display = "none";
          document.getElementById("pm-status").value = "active";
          const fdElNew = document.getElementById("pm-free-delivery");
          if (fdElNew) fdElNew.checked = false;
          buildCheckboxGroup(
            "pm-categories",
            categories.map(c => Object.assign({}, c, { label: _pLang(c) })),
            [],
            "refreshSubCatCheckboxes",
          );
          buildCheckboxGroup("pm-subcategories", [], []);
          buildCheckboxGroup("pm-subsubcategories", [], []);
          addVariant();
          addFlavor();
        }
        openModal("product-modal");
      }

      function editProduct(id) {
        openProductModal(id);
      }

      function addVariant(v = null) {
        const list = document.getElementById("variants-list");
        const div = document.createElement("div");
        div.className = "variant-row";
        if (v && v.flavorStock) div.dataset.flavorStock = JSON.stringify(v.flavorStock);
        if (v && v.stock !== undefined) div.dataset.varStock = String(v.stock);
        const existingLabelEn = v ? (v.labelEn || v.label || (v.weight ? `${v.weight}${v.unit || ''}` : '')) : '';
        const existingLabelFr = v ? (v.labelFr || '') : '';
        const existingLabelAr = v ? (v.labelAr || '') : '';
        const existingWidth = v && v.sizeMode ? (v.width || '') : '';
        const existingHeight = v && v.sizeMode ? (v.height || '') : '';
        const existingUnit = v && v.sizeMode ? (v.unit || 'cm') : 'cm';
        const isCustomChecked = document.getElementById("pm-custom-variants")?.checked;
        const showCustom = v ? !v.sizeMode : !!isCustomChecked;
        div.innerHTML = `
          <div class="form-group variant-label-wrap" style="flex:2">
            <div class="variant-size-block" style="display:${showCustom ? "none" : "flex"};gap:6px;align-items:flex-end;flex-wrap:wrap">
              <div style="flex:1"><label>${t('pm.width')}</label><input type="number" class="form-control variant-width-input" placeholder="120" value="${existingWidth}" min="0" oninput="refreshStockMatrix()" /></div>
              <span style="padding-bottom:11px;color:var(--g400)">×</span>
              <div style="flex:1"><label>${t('pm.height')}</label><input type="number" class="form-control variant-height-input" placeholder="180" value="${existingHeight}" min="0" oninput="refreshStockMatrix()" /></div>
              <div style="width:66px"><label>${t('pm.unit')}</label><select class="form-control form-select variant-unit-input" onchange="refreshStockMatrix()"><option value="cm"${existingUnit === "cm" ? " selected" : ""}>cm</option><option value="m"${existingUnit === "m" ? " selected" : ""}>M</option></select></div>
            </div>
            <div class="variant-custom-block" style="display:${showCustom ? "block" : "none"}">
              <label>Label</label>
              <input type="text" class="form-control variant-label-input" placeholder="EN *" value="${existingLabelEn}" oninput="refreshStockMatrix()" />
              <input type="text" class="form-control variant-label-fr" placeholder="FR" value="${existingLabelFr}" style="margin-top:4px" />
              <input type="text" class="form-control variant-label-ar" placeholder="AR" value="${existingLabelAr}" dir="rtl" style="margin-top:4px;text-align:right;font-family:'Cairo','Tajawal',sans-serif" />
            </div>
          </div>
          <div class="form-group"><label>Price (DA)</label><input type="number" class="form-control variant-price-input" placeholder="0" value="${v ? v.price : ""}" /></div>
          <button class="btn-remove-variant" onclick="this.closest('.variant-row').remove();refreshStockMatrix()">×</button>`;
        list.appendChild(div);
        refreshStockMatrix();
      }

      /* Returns the display label for a variant row regardless of which
         input mode (standard size vs. free-text) is currently active. */
      function _variantRowLabel(row) {
        const isCustom = document.getElementById("pm-custom-variants")?.checked;
        if (isCustom) {
          return (row.querySelector(".variant-label-input")?.value || "").trim();
        }
        const w = (row.querySelector(".variant-width-input")?.value || "").trim();
        const h = (row.querySelector(".variant-height-input")?.value || "").trim();
        const u = row.querySelector(".variant-unit-input")?.value || "cm";
        if (!w || !h) return "";
        return `${w}${u} X ${h}${u}`;
      }

      function toggleVariantInputMode() {
        const isCustom = document.getElementById("pm-custom-variants")?.checked;
        document.querySelectorAll("#variants-list .variant-size-block").forEach((el) => {
          el.style.display = isCustom ? "none" : "flex";
        });
        document.querySelectorAll("#variants-list .variant-custom-block").forEach((el) => {
          el.style.display = isCustom ? "block" : "none";
        });
        refreshStockMatrix();
      }

      function addFlavor(f = null) {
        const list = document.getElementById("flavors-list");
        const div = document.createElement("div");
        div.className = "flavor-row";
        const fNameEn = f ? (f.nameEn || f.name || '') : '';
        const fNameFr = f ? (f.nameFr || '') : '';
        const fNameAr = f ? (f.nameAr || '') : '';
        div.innerHTML = `<div class="form-group" style="flex:2"><label>Shade / Color / Option</label><input type="text" class="form-control flavor-name-input" placeholder="EN *  e.g. Red No.5, Nude Beige…" value="${fNameEn}" oninput="refreshStockMatrix()" /><input type="text" class="form-control flavor-name-fr" placeholder="FR" value="${fNameFr}" style="margin-top:4px" /><input type="text" class="form-control flavor-name-ar" placeholder="AR" value="${fNameAr}" dir="rtl" style="margin-top:4px;text-align:right;font-family:'Cairo','Tajawal',sans-serif" /></div><div class="form-group flavor-qty-cell"><label>Qty (no variants)</label><input type="number" class="form-control flavor-qty-input" placeholder="0" value="${f && f.qty ? f.qty : ""}" min="0" oninput="refreshStockMatrix()" /></div><button class="btn-remove-variant" onclick="this.closest('.flavor-row').remove();refreshStockMatrix()">×</button>`;
        list.appendChild(div);
        refreshStockMatrix();
      }

      /* ── Stock Matrix helpers ── */
      function refreshStockMatrix() {
        const variantRows = Array.from(document.querySelectorAll("#variants-list .variant-row"));
        const flavorRows  = Array.from(document.querySelectorAll("#flavors-list .flavor-row"));
        const flavors = flavorRows.map(r => (r.querySelector(".flavor-name-input")?.value || "").trim()).filter(Boolean);
        const hasVariants = variantRows.length > 0;
        const hasFlavors  = flavors.length > 0;
        const showMatrix  = hasVariants && hasFlavors;

        // Preserve current values before re-render
        const matrixVals = {};
        document.querySelectorAll("#stock-matrix-body input").forEach(inp => {
          matrixVals[`${inp.dataset.vi}_${inp.dataset.fn}`] = parseInt(inp.value) || 0;
        });
        const vstockVals = {};
        document.querySelectorAll("#variant-stock-list .vstock-input").forEach(inp => {
          vstockVals[String(inp.dataset.vi)] = parseInt(inp.value) || 0;
        });
        // If switching matrix→variant-only: seed variant stocks from matrix row totals
        if (!Object.keys(vstockVals).length && Object.keys(matrixVals).length) {
          document.querySelectorAll("#stock-matrix-body tr").forEach((row, vi) => {
            vstockVals[String(vi)] = Array.from(row.querySelectorAll("input")).reduce((s, i) => s + (parseInt(i.value) || 0), 0);
          });
        }

        const pmStock = document.getElementById("pm-stock");
        const pmHint  = document.getElementById("pm-stock-hint");

        document.querySelectorAll(".flavor-qty-cell").forEach(el => {
          el.style.display = showMatrix ? "none" : "";
        });

        if (showMatrix) {
          document.getElementById("variant-stock-section").style.display = "none";
          document.getElementById("stock-matrix-section").style.display = "";
          pmStock.readOnly = true; pmHint.style.display = "";

          const varMeta = variantRows.map((row, vi) => {
            const lbl = _variantRowLabel(row) || `V${vi+1}`;
            return { vi, label: lbl, fs: JSON.parse(row.dataset.flavorStock || "{}") };
          });

          let head = "<tr><th>Variant</th>";
          flavors.forEach(fn => { head += `<th>${fn}</th>`; });
          head += "<th>Total</th></tr>";
          document.getElementById("stock-matrix-head").innerHTML = head;

          let body = "";
          varMeta.forEach(({ vi, label, fs }) => {
            body += `<tr><td>${label}</td>`;
            let rowTotal = 0;
            flavors.forEach(fn => {
              const key = `${vi}_${fn}`;
              const val = matrixVals[key] !== undefined ? matrixVals[key] : (fs[fn] !== undefined ? Number(fs[fn]) : 0);
              rowTotal += val;
              body += `<td><input type="number" class="form-control matrix-cell" min="0" value="${val}" data-vi="${vi}" data-fn="${fn}" oninput="updateMatrixTotals()"></td>`;
            });
            body += `<td class="matrix-total" id="mrt-${vi}">${rowTotal}</td></tr>`;
          });
          document.getElementById("stock-matrix-body").innerHTML = body;
          updateMatrixTotals();

        } else if (hasVariants) {
          document.getElementById("stock-matrix-section").style.display = "none";
          document.getElementById("variant-stock-section").style.display = "";
          pmStock.readOnly = true; pmHint.style.display = "";

          document.getElementById("variant-stock-list").innerHTML = variantRows.map((row, vi) => {
            const label = _variantRowLabel(row) || `V${vi+1}`;
            const stock = vstockVals[String(vi)] !== undefined ? vstockVals[String(vi)] : (parseInt(row.dataset.varStock) || 0);
            return `<div class="vstock-row"><span class="vstock-label">${label}</span><input type="number" class="form-control vstock-input" data-vi="${vi}" value="${stock}" min="0" placeholder="0" oninput="refreshStockTotal()"></div>`;
          }).join("");
          refreshStockTotal();

        } else {
          document.getElementById("stock-matrix-section").style.display = "none";
          document.getElementById("variant-stock-section").style.display = "none";
          pmStock.readOnly = false; pmHint.style.display = "none";
          if (hasFlavors) {
            pmStock.value = flavorRows.reduce((s, r) => s + (parseInt(r.querySelector(".flavor-qty-input")?.value) || 0), 0);
          }
        }
      }

      function updateMatrixTotals() {
        let grand = 0;
        document.querySelectorAll("#stock-matrix-body tr").forEach((row, vi) => {
          const sum = Array.from(row.querySelectorAll("input")).reduce((s, i) => s + (parseInt(i.value) || 0), 0);
          const cell = document.getElementById(`mrt-${vi}`);
          if (cell) cell.textContent = sum;
          grand += sum;
        });
        document.getElementById("pm-stock").value = grand;
      }

      function refreshStockTotal() {
        const total = Array.from(document.querySelectorAll("#variant-stock-list .vstock-input"))
          .reduce((s, i) => s + (parseInt(i.value) || 0), 0);
        document.getElementById("pm-stock").value = total;
      }

      async function saveProduct() {
        const nameEn = document.getElementById("pm-name-en").value.trim();
        const nameFr = document.getElementById("pm-name-fr").value.trim();
        const nameAr = document.getElementById("pm-name-ar").value.trim();
        if (!nameEn) {
          showToast("Product name (English) required", "error");
          return;
        }
        const categoryIds = getCheckedValues("pm-categories");
        const subCategoryIds = getCheckedValues("pm-subcategories");
        const subSubCategoryIds = getCheckedValues("pm-subsubcategories");
        const showMatrix = document.getElementById("stock-matrix-section").style.display !== "none";
        const showVStock = document.getElementById("variant-stock-section").style.display !== "none";

        const isCustomVariants = document.getElementById("pm-custom-variants")?.checked;
        const variants = Array.from(document.querySelectorAll("#variants-list .variant-row"))
          .map((r, vi) => {
            let label, labelEn, labelFr, labelAr, width, height, unit;
            if (isCustomVariants) {
              labelEn = r.querySelector(".variant-label-input")?.value.trim() || "";
              labelFr = r.querySelector(".variant-label-fr")?.value.trim() || "";
              labelAr = r.querySelector(".variant-label-ar")?.value.trim() || "";
              label = labelEn;
            } else {
              width = r.querySelector(".variant-width-input")?.value.trim() || "";
              height = r.querySelector(".variant-height-input")?.value.trim() || "";
              unit = r.querySelector(".variant-unit-input")?.value || "cm";
              label = (width && height) ? `${width}${unit} X ${height}${unit}` : "";
              labelEn = labelFr = labelAr = label;
            }
            const priceEl = r.querySelector(".variant-price-input");
            const v = { label, labelEn, labelFr, labelAr, price: parseFloat(priceEl?.value) || 0 };
            if (!isCustomVariants) { v.sizeMode = true; v.width = width; v.height = height; v.unit = unit; }
            if (showMatrix) {
              v.flavorStock = {};
              document.querySelectorAll(`#stock-matrix-body input[data-vi="${vi}"]`).forEach(inp => {
                v.flavorStock[inp.dataset.fn] = parseInt(inp.value) || 0;
              });
              v.stock = Object.values(v.flavorStock).reduce((s, q) => s + q, 0);
            } else if (showVStock) {
              const vstockInp = document.querySelector(`#variant-stock-list .vstock-input[data-vi="${vi}"]`);
              v.stock = parseInt(vstockInp?.value) || 0;
            }
            return v;
          })
          .filter((v) => v.label);

        const flavors = Array.from(document.querySelectorAll("#flavors-list .flavor-row"))
          .map((r) => {
            const nameEn = r.querySelector(".flavor-name-input")?.value.trim() || "";
            const nameFr = r.querySelector(".flavor-name-fr")?.value.trim() || "";
            const nameAr = r.querySelector(".flavor-name-ar")?.value.trim() || "";
            const qty    = parseInt(r.querySelector(".flavor-qty-input")?.value) || 0;
            return { name: nameEn, nameEn, nameFr, nameAr, qty };
          })
          .filter((f) => f.name);

        // Compute global stock
        let globalStock;
        if (variants.length > 0) {
          globalStock = variants.reduce((s, v) => s + (v.stock || 0), 0);
        } else if (flavors.length > 0) {
          globalStock = flavors.reduce((s, f) => s + f.qty, 0);
        } else {
          globalStock = parseInt(document.getElementById("pm-stock").value) || 0;
        }

        const payload = {
          name: nameEn,
          nameEn,
          nameFr,
          nameAr,
          brand: document.getElementById("pm-brand-en").value.trim(),
          brandEn: document.getElementById("pm-brand-en").value.trim(),
          brandFr: document.getElementById("pm-brand-fr").value.trim(),
          brandAr: document.getElementById("pm-brand-ar").value.trim(),
          categoryIds,
          subCategoryIds,
          subSubCategoryIds,
          description: document.getElementById("pm-desc-en").innerHTML.trim(),
          descriptionEn: document.getElementById("pm-desc-en").innerHTML.trim(),
          descriptionFr: document.getElementById("pm-desc-fr").innerHTML.trim(),
          descriptionAr: document.getElementById("pm-desc-ar").innerHTML.trim(),
          imageUrl: currentImageUrls,
          variants,
          flavors,
          stock: globalStock,
          discount: parseInt(document.getElementById("pm-discount").value) || 0,
          freeDelivery: document.getElementById("pm-free-delivery")?.checked || false,
          status: document.getElementById("pm-status").value,
        };
        document.getElementById("pm-save-btn").disabled = true;
        showLoading("Saving product…");
        try {
          payload.action = editingProductId ? "updateProduct" : "addProduct";
          if (editingProductId) payload.id = editingProductId;
          const r = await apiPost(payload);
          if (r.success) {
            showToast(editingProductId ? "Product updated!" : "Product added!");
            closeModal("product-modal");
            // Local mutation — no refetch round-trip
            if (editingProductId) {
              const idx = products.findIndex(p => p.id === editingProductId);
              if (idx >= 0) products[idx] = { ...products[idx], ...payload, id: editingProductId };
            } else {
              const newProduct = { ...payload, id: r.id || ("tmp_" + Date.now()) };
              products.unshift(newProduct);
            }
            renderProducts();
            renderBundleList(document.getElementById("bundle-search")?.value || "");
            updateDashboard();
            // Silent background sync to pick up server-canonical IDs
          } else showToast("Error: " + (r.error || "Unknown"), "error");
        } catch (e) {
          showToast("Error: " + e.message, "error");
        }
        document.getElementById("pm-save-btn").disabled = false;
        hideLoading();
      }

      // ════════════════════════════════════════════
      // CATEGORIES
      // ════════════════════════════════════════════
      function renderCats() {
        _selReset("cat");
        const tree = document.getElementById("cat-tree");
        const pag = document.getElementById("cat-pag");
        if (!categories.length) {
          tree.innerHTML =
            `<div class="empty-state"><p>${t('cats.empty')}</p></div>`;
          if (pag) pag.innerHTML = "";
          return;
        }
        const pageItems = categories.slice((catPage - 1) * _PAGE, catPage * _PAGE);
        tree.innerHTML = pageItems
          .map((c) => {
            const subs = subCategories.filter((s) =>
              s.categoryIds && s.categoryIds.includes(c.id),
            );
            const catIconHtml = c.imageUrl
              ? `<img src="${c.imageUrl}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:inherit" />`
              : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/></svg>`;
            return `<div class="cat-node"><div class="cat-row" id="cat-row-${c.id}" onclick="toggleCat('${c.id}',event)"><input type="checkbox" class="row-cb" data-sel-type="cat" data-sel-id="${c.id}" onclick="event.stopPropagation()" onchange="_selToggleCat('${c.id}',this.checked)" style="margin-right:8px;width:15px;height:15px;accent-color:var(--red);cursor:pointer;flex-shrink:0"><div class="cat-expand" id="cat-exp-${c.id}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></div><div class="cat-icon" style="overflow:hidden">${catIconHtml}</div><div class="cat-name">${_pLang(c)}</div>${c.description ? `<span style="font-size:11px;color:var(--g400);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.description}</span>` : ""}${subs.length > 0 ? `<span class="cat-count">${subs.length} sub${subs.length !== 1 ? "s" : ""}</span>` : ""}<div class="action-group"><button class="act-btn act-edit" onclick="editCat('${c.id}');event.stopPropagation()">Edit</button><button class="act-btn act-delete" onclick="confirmDelete('cat','${c.id}');event.stopPropagation()">Delete</button></div></div><div class="sub-cats" id="sub-cats-${c.id}">${subs.map((s) => {
              const subSubs = subSubCategories.filter((ss) => ss.subCategoryIds && ss.subCategoryIds.includes(s.id));
              return `<div class="sub-node"><div class="sub-icon"></div><div class="sub-name">${_pLang(s)}</div><div class="sub-actions"><button class="act-btn act-edit" onclick="editSubCat('${s.id}')">Edit</button><button class="act-btn act-delete" onclick="confirmDelete('subcat','${s.id}')">Delete</button></div></div>${subSubs.map((ss) => `<div class="subsub-node"><div class="subsub-icon"></div><div class="subsub-name">${_pLang(ss)}</div><div class="sub-actions"><button class="act-btn act-edit" onclick="editSubSubCat('${ss.id}')">Edit</button><button class="act-btn act-delete" onclick="confirmDelete('subsubcat','${ss.id}')">Delete</button></div></div>`).join("")}`;
            }).join("")}</div></div>`;
          })
          .join("");
        if (pag) pag.innerHTML = _pagCtrl(categories.length, catPage, "setCatPage");
      }

      function _selToggleCat(id, checked) {
        if (checked) _sel.cat.add(id);
        else _sel.cat.delete(id);
        const bar = document.getElementById("sel-bar-cat");
        if (bar) bar.classList.toggle("visible", _sel.cat.size > 0);
        const label = document.getElementById("sel-count-cat");
        const n = _sel.cat.size;
        if (label) label.textContent = n + " " + (n !== 1 ? t('sel.items') : t('sel.item'));
      }
      function toggleCat(catId, e) {
        if (e && e.target.closest("button")) return;
        const sub = document.getElementById("sub-cats-" + catId);
        const exp = document.getElementById("cat-exp-" + catId);
        if (!sub || !exp) return;
        const isOpen = sub.classList.toggle("open");
        exp.classList.toggle("open", isOpen);
      }
      function openCatModal() {
        editingCatId = null;
        document.getElementById("cat-modal-title").textContent = t('cat.addTitle');
        document.getElementById("cat-name-en").value = "";
        document.getElementById("cat-name-fr").value = "";
        document.getElementById("cat-name-ar").value = "";
        document.getElementById("cat-desc").value = "";
        document.getElementById("sub-items-list").innerHTML = "";
        currentCatImageUrl = "";
        renderCatImageGrid();
        openModal("cat-modal");
      }
      function editCat(id) {
        const cat = categories.find((c) => c.id === id);
        if (!cat) return;
        editingCatId = id;
        document.getElementById("cat-modal-title").textContent = t('cat.editTitle');
        document.getElementById("cat-name-en").value = cat.nameEn || cat.name || "";
        document.getElementById("cat-name-fr").value = cat.nameFr || "";
        document.getElementById("cat-name-ar").value = cat.nameAr || "";
        document.getElementById("cat-desc").value = cat.description || "";
        currentCatImageUrl = cat.imageUrl || "";
        renderCatImageGrid();
        const subs = subCategories.filter((s) => s.categoryIds && s.categoryIds.includes(id));
        document.getElementById("sub-items-list").innerHTML = subs
          .map((s) => {
            const subSubs = subSubCategories.filter((ss) => ss.subCategoryIds && ss.subCategoryIds.includes(s.id));
            const subSubHtml = subSubs.map((ss) => `<div class="subsub-item-row" data-subsub-id="${ss.id}">
              <input type="text" class="form-control" style="flex:1;min-width:70px" placeholder="EN" value="${(ss.nameEn||ss.name||'').replace(/"/g,'&quot;')}" data-lang="en" />
              <input type="text" class="form-control" style="flex:1;min-width:70px" placeholder="FR" value="${(ss.nameFr||'').replace(/"/g,'&quot;')}" data-lang="fr" />
              <input type="text" class="form-control" style="flex:1;min-width:70px;text-align:right;font-family:'Cairo','Tajawal',sans-serif" dir="rtl" placeholder="AR" value="${(ss.nameAr||'').replace(/"/g,'&quot;')}" data-lang="ar" />
              <button class="btn-rem-sub" onclick="this.closest('.subsub-item-row').remove()">×</button></div>`).join("");
            return `<div class="sub-item-wrap" data-sub-id="${s.id}">
              <div class="sub-item-row">
                <input type="text" class="form-control" style="flex:1;min-width:80px" placeholder="EN" value="${(s.nameEn||s.name||'').replace(/"/g,'&quot;')}" data-lang="en" />
                <input type="text" class="form-control" style="flex:1;min-width:80px" placeholder="FR" value="${(s.nameFr||'').replace(/"/g,'&quot;')}" data-lang="fr" />
                <input type="text" class="form-control" style="flex:1;min-width:80px;text-align:right;font-family:'Cairo','Tajawal',sans-serif" dir="rtl" placeholder="AR" value="${(s.nameAr||'').replace(/"/g,'&quot;')}" data-lang="ar" />
                <button class="btn-rem-sub" onclick="this.closest('.sub-item-wrap').remove()">×</button>
              </div>
              <div class="subsub-items-list">${subSubHtml}</div>
              <button class="btn-add-subsub" type="button" onclick="addSubSubItem(this)">+ Add Sub-subcategory</button>
            </div>`;
          })
          .join("");
        openModal("cat-modal");
      }
      function addSubItem() {
        const list = document.getElementById("sub-items-list");
        const wrap = document.createElement("div");
        wrap.className = "sub-item-wrap";
        wrap.innerHTML = `<div class="sub-item-row"><input type="text" class="form-control" style="flex:1;min-width:80px" placeholder="EN" data-lang="en" /><input type="text" class="form-control" style="flex:1;min-width:80px" placeholder="FR" data-lang="fr" /><input type="text" class="form-control" style="flex:1;min-width:80px;text-align:right;font-family:'Cairo','Tajawal',sans-serif" dir="rtl" placeholder="AR" data-lang="ar" /><button class="btn-rem-sub" onclick="this.closest('.sub-item-wrap').remove()">×</button></div><div class="subsub-items-list"></div><button class="btn-add-subsub" type="button" onclick="addSubSubItem(this)">+ Add Sub-subcategory</button>`;
        list.appendChild(wrap);
      }
      function addSubSubItem(btn) {
        const wrap = btn.closest(".sub-item-wrap");
        const list = wrap.querySelector(".subsub-items-list");
        const row = document.createElement("div");
        row.className = "subsub-item-row";
        row.innerHTML = `<input type="text" class="form-control" style="flex:1;min-width:70px" placeholder="EN" data-lang="en" /><input type="text" class="form-control" style="flex:1;min-width:70px" placeholder="FR" data-lang="fr" /><input type="text" class="form-control" style="flex:1;min-width:70px;text-align:right;font-family:'Cairo','Tajawal',sans-serif" dir="rtl" placeholder="AR" data-lang="ar" /><button class="btn-rem-sub" onclick="this.closest('.subsub-item-row').remove()">×</button>`;
        list.appendChild(row);
      }
      function renderCatImageGrid() {
        const grid = document.getElementById("cat-image-grid");
        if (!grid) return;
        grid.innerHTML = "";
        if (currentCatImageUrl) {
          const wrap = document.createElement("div");
          wrap.className = "img-thumb-wrap";
          wrap.innerHTML = `<img src="${currentCatImageUrl}" /><span class="img-thumb-remove" onclick="removeCatImage()">×</span>`;
          grid.appendChild(wrap);
        } else {
          const addBtn = document.createElement("div");
          addBtn.className = "upload-box-add";
          addBtn.innerHTML = `<input type="file" accept="image/*" onchange="handleCatImageUpload(event)" /><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
          grid.appendChild(addBtn);
        }
      }
      function removeCatImage() {
        currentCatImageUrl = "";
        renderCatImageGrid();
      }
      async function handleCatImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        e.target.value = "";
        showLoading("Uploading image…");
        try {
          const fd = new FormData();
          fd.append("file", file);
          fd.append("upload_preset", CLOUDINARY_PRESET);
          fd.append("folder", "maison-comfort-categories");
          const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, { method: "POST", body: fd });
          const data = await res.json();
          if (data.secure_url) {
            currentCatImageUrl = data.secure_url;
            renderCatImageGrid();
            showToast("Image uploaded!");
          } else {
            showToast("Upload failed: " + (data.error?.message || "Unknown"), "error");
          }
        } catch (err) {
          showToast("Upload error: " + err.message, "error");
        }
        hideLoading();
      }
      async function saveCat() {
        const nameEn = document.getElementById("cat-name-en").value.trim();
        const nameFr = document.getElementById("cat-name-fr").value.trim();
        const nameAr = document.getElementById("cat-name-ar").value.trim();
        if (!nameEn) { showToast("English name required", "error"); return; }
        const subWraps = Array.from(document.querySelectorAll("#sub-items-list .sub-item-wrap"));
        const subs = subWraps.map((wrap) => {
          const row = wrap.querySelector(".sub-item-row");
          const subSubRows = Array.from(wrap.querySelectorAll(".subsub-item-row"));
          const subSubList = subSubRows.map((r) => ({
            id: r.dataset.subsubId || "",
            nameEn: (r.querySelector('[data-lang="en"]')?.value || "").trim(),
            nameFr: (r.querySelector('[data-lang="fr"]')?.value || "").trim(),
            nameAr: (r.querySelector('[data-lang="ar"]')?.value || "").trim(),
          })).filter((ss) => ss.nameEn);
          return {
            id: wrap.dataset.subId || "",
            nameEn: (row.querySelector('[data-lang="en"]')?.value || "").trim(),
            nameFr: (row.querySelector('[data-lang="fr"]')?.value || "").trim(),
            nameAr: (row.querySelector('[data-lang="ar"]')?.value || "").trim(),
            subSubCategories: subSubList,
          };
        }).filter((s) => s.nameEn);
        showLoading(editingCatId ? "Updating category…" : "Saving category…");
        try {
          const desc = document.getElementById("cat-desc").value.trim();
          const payload = editingCatId
            ? { action: "updateCategory", id: editingCatId, nameEn, nameFr, nameAr, description: desc, imageUrl: currentCatImageUrl, subCategories: subs }
            : { action: "addCategory", nameEn, nameFr, nameAr, description: desc, imageUrl: currentCatImageUrl, subCategories: subs };
          const r = await apiPost(payload);
          if (r.success) {
            showToast(editingCatId ? "Category updated!" : "Category saved!");
            closeModal("cat-modal");
            editingCatId = null;
            await loadCategories();
            updateDashboard();
          } else showToast("Error: " + (r.error || "Unknown"), "error");
        } catch (e) {
          showToast("Error: " + e.message, "error");
        }
        hideLoading();
      }
      function editSubCat(id) {
        const sub = subCategories.find((s) => s.id === id);
        if (!sub) return;
        editingSubCatId = id;
        document.getElementById("subcat-name-en").value = sub.nameEn || sub.name || "";
        document.getElementById("subcat-name-fr").value = sub.nameFr || "";
        document.getElementById("subcat-name-ar").value = sub.nameAr || "";
        openModal("subcat-edit-modal");
      }
      async function saveSubCat() {
        const nameEn = document.getElementById("subcat-name-en").value.trim();
        const nameFr = document.getElementById("subcat-name-fr").value.trim();
        const nameAr = document.getElementById("subcat-name-ar").value.trim();
        if (!nameEn) { showToast("English name required", "error"); return; }
        showLoading("Updating sub-category…");
        try {
          const r = await apiPost({ action: "updateSubCategory", id: editingSubCatId, nameEn, nameFr, nameAr });
          if (r.success) {
            showToast("Sub-category updated!");
            closeModal("subcat-edit-modal");
            const sIdx = subCategories.findIndex(s => s.id === editingSubCatId);
            if (sIdx >= 0) subCategories[sIdx] = { ...subCategories[sIdx], name: nameEn, nameEn, nameFr, nameAr };
            editingSubCatId = null;
            renderCats();
          } else showToast("Error: " + (r.error || "Unknown"), "error");
        } catch (e) {
          showToast("Error: " + e.message, "error");
        }
        hideLoading();
      }
      function editSubSubCat(id) {
        const ss = subSubCategories.find((s) => s.id === id);
        if (!ss) return;
        editingSubSubCatId = id;
        document.getElementById("subsubcat-name-en").value = ss.nameEn || ss.name || "";
        document.getElementById("subsubcat-name-fr").value = ss.nameFr || "";
        document.getElementById("subsubcat-name-ar").value = ss.nameAr || "";
        openModal("subsubcat-edit-modal");
      }
      async function saveSubSubCat() {
        const nameEn = document.getElementById("subsubcat-name-en").value.trim();
        const nameFr = document.getElementById("subsubcat-name-fr").value.trim();
        const nameAr = document.getElementById("subsubcat-name-ar").value.trim();
        if (!nameEn) { showToast("English name required", "error"); return; }
        showLoading("Updating sub-subcategory…");
        try {
          const r = await apiPost({ action: "updateSubSubCategory", id: editingSubSubCatId, nameEn, nameFr, nameAr });
          if (r.success) {
            showToast("Sub-subcategory updated!");
            closeModal("subsubcat-edit-modal");
            const sIdx = subSubCategories.findIndex(s => s.id === editingSubSubCatId);
            if (sIdx >= 0) subSubCategories[sIdx] = { ...subSubCategories[sIdx], name: nameEn, nameEn, nameFr, nameAr };
            editingSubSubCatId = null;
            renderCats();
          } else showToast("Error: " + (r.error || "Unknown"), "error");
        } catch (e) {
          showToast("Error: " + e.message, "error");
        }
        hideLoading();
      }

      // ════════════════════════════════════════════
      // SETTINGS
      // ════════════════════════════════════════════
      async function saveFreeDeliverySettings() {
        const threshold = parseFloat(document.getElementById("free-delivery-threshold").value) || 0;
        const allFree = document.getElementById("all-free-delivery").checked;
        showLoading("Saving…");
        try {
          const r = await apiPost({
            action: "updateSettings",
            updates: {
              all_free_delivery: String(allFree),
              free_delivery_threshold: String(threshold),
            },
          });
          if (!r.success) throw new Error(r.error || "Unknown error");
          settings.all_free_delivery = String(allFree);
          settings.free_delivery_threshold = String(threshold);
          showToast("Free delivery settings saved!");
        } catch (e) {
          showToast("Save failed: " + (e.message || "Unknown error"), "error");
        } finally {
          hideLoading();
        }
      }

      async function saveAnnouncement() {
        const enabled = document.getElementById("ann-enabled").checked;
        const textEn = document.getElementById("ann-text-en").value.trim();
        const textFr = document.getElementById("ann-text-fr").value.trim();
        const textAr = document.getElementById("ann-text-ar").value.trim();
        const linkTextEn = document.getElementById("ann-link-text-en").value.trim();
        const linkTextFr = document.getElementById("ann-link-text-fr").value.trim();
        const linkTextAr = document.getElementById("ann-link-text-ar").value.trim();
        const linkUrl = document.getElementById("ann-link-url").value.trim();
        if (enabled && !textEn) {
          showToast("Announcement text (English) required", "error");
          return;
        }
        showLoading("Saving…");
        try {
          const updates = {
            announcement_enabled: String(enabled),
            announcement_text_en: textEn,
            announcement_text_fr: textFr,
            announcement_text_ar: textAr,
            announcement_link_text_en: linkTextEn,
            announcement_link_text_fr: linkTextFr,
            announcement_link_text_ar: linkTextAr,
            announcement_link_url: linkUrl,
          };
          const r = await apiPost({ action: "updateSettings", updates });
          if (!r.success) throw new Error(r.error || "Unknown error");
          Object.assign(settings, updates);
          showToast("Announcement saved!");
        } catch (e) {
          showToast("Save failed: " + (e.message || "Unknown error"), "error");
        } finally {
          hideLoading();
        }
      }

      async function saveUsername() {
        const u = document.getElementById("set-username").value.trim();
        const d = document.getElementById("set-displayname").value.trim();
        if (!u) {
          showToast("Username required", "error");
          return;
        }
        showLoading("Saving…");
        try {
          const r = await apiPost({
            action: "updateSettings",
            updates: { admin_username: u, admin_displayname: d || u },
          });
          if (r.success) {
            settings.admin_username = u;
            settings.admin_displayname = d || u;
            document.getElementById("sb-username").textContent = d || u;
            document.querySelector(".sb-avatar").textContent = (d ||
              u)[0].toUpperCase();
            showToast("Account info saved!");
          }
        } catch (e) {
          showToast("Error: " + e.message, "error");
        }
        hideLoading();
      }
      async function savePassword() {
        const cur = document.getElementById("set-cur-pass").value;
        const nw = document.getElementById("set-new-pass").value;
        const cf = document.getElementById("set-confirm-pass").value;
        if (!cur) { showToast("Enter current password", "error"); return; }
        if (nw.length < 4) { showToast("Min 4 characters", "error"); return; }
        if (nw !== cf) { showToast("Passwords do not match", "error"); return; }
        showLoading("Verifying…");
        try {
          const { data: { user } } = await sb.auth.getUser();
          const email = user?.email;
          if (!email) { hideLoading(); showToast("Session error — please re-login", "error"); return; }
          const { error: verifyErr } = await sb.auth.signInWithPassword({ email, password: cur });
          if (verifyErr) { hideLoading(); showToast("Current password is wrong", "error"); return; }
          const { error: updateErr } = await sb.auth.updateUser({ password: nw });
          if (updateErr) {
            showToast("Error: " + updateErr.message, "error");
          } else {
            ["set-cur-pass", "set-new-pass", "set-confirm-pass"].forEach((x) => (document.getElementById(x).value = ""));
            showToast("Password updated!");
          }
        } catch (e) {
          showToast("Error: " + e.message, "error");
        }
        hideLoading();
      }

      // ════════════════════════════════════════════
      // MANAGE USERS
      // ════════════════════════════════════════════
      let _adminUsers = [];

      async function _manageUsersToken() {
        const { data: sd } = await sb.auth.getSession();
        return sd?.session?.access_token || SUPABASE_ANON_KEY;
      }

      async function loadAdminUsers() {
        const list = document.getElementById("users-list");
        try {
          const token = await _manageUsersToken();
          const res = await fetch(SUPABASE_URL + "/functions/v1/manage-users", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
            body: JSON.stringify({ action: "list" }),
          });
          const r = await res.json();
          if (!r.success) { list.innerHTML = '<div style="color:var(--danger);font-size:13px">Failed to load users</div>'; return; }
          _adminUsers = r.users;
          const { data: { user: me } } = await sb.auth.getUser();
          if (!_adminUsers.length) { list.innerHTML = '<div style="color:var(--g400);font-size:13px">No users found</div>'; return; }
          list.innerHTML = _adminUsers.map((u) => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:var(--g50);border-radius:8px;border:1px solid var(--g100)">
              <div>
                <div style="font-size:14px;font-weight:500">${u.email}</div>
                <div style="font-size:11px;color:var(--g400)">Created ${new Date(u.created_at).toLocaleDateString()}</div>
              </div>
              ${u.id !== me?.id ? `<button onclick="deleteAdminUser('${u.id}','${u.email}')" style="background:none;border:none;cursor:pointer;color:var(--danger);padding:4px 8px;border-radius:6px;font-size:12px;font-weight:600" onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='none'">Delete</button>` : `<span style="font-size:11px;color:var(--g400);padding:4px 8px">You</span>`}
            </div>`).join("");
        } catch (e) {
          if (list) list.innerHTML = '<div style="color:var(--danger);font-size:13px">Failed to load users</div>';
        }
      }

      async function createAdminUser() {
        const email = document.getElementById("new-user-email").value.trim();
        const password = document.getElementById("new-user-pass").value;
        if (!email) { showToast("Email is required", "error"); return; }
        if (!password) { showToast("Password is required", "error"); return; }
        showLoading("Creating user…");
        try {
          const token = await _manageUsersToken();
          const res = await fetch(SUPABASE_URL + "/functions/v1/manage-users", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
            body: JSON.stringify({ action: "create", email, password }),
          });
          const r = await res.json();
          if (r.success) {
            document.getElementById("new-user-email").value = "";
            document.getElementById("new-user-pass").value = "";
            showToast("User created!");
            await loadAdminUsers();
          } else {
            showToast("Error: " + r.error, "error");
          }
        } catch (e) {
          showToast("Error: " + e.message, "error");
        }
        hideLoading();
      }

      async function deleteAdminUser(uid, email) {
        if (!confirm(`Delete user ${email}? This cannot be undone.`)) return;
        showLoading("Deleting user…");
        try {
          const token = await _manageUsersToken();
          const res = await fetch(SUPABASE_URL + "/functions/v1/manage-users", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
            body: JSON.stringify({ action: "delete", uid }),
          });
          const r = await res.json();
          if (r.success) {
            showToast("User deleted");
            await loadAdminUsers();
          } else {
            showToast("Error: " + r.error, "error");
          }
        } catch (e) {
          showToast("Error: " + e.message, "error");
        }
        hideLoading();
      }

      // ════════════════════════════════════════════
      // CONFIRM DELETE
      // ════════════════════════════════════════════
      function confirmDelete(type, id) {
        const msgs = {
          product: "This product will be permanently deleted.",
          cat: "This category and its sub-categories will be removed.",
          subcat: "This sub-category will be removed.",
          subsubcat: "This sub-subcategory will be removed.",
          delivery: "This delivery price will be permanently deleted.",
          order: "This order will be permanently deleted and cannot be recovered.",
        };
        document.getElementById("confirm-msg").textContent =
          msgs[type] || "This action cannot be undone.";
        document.getElementById("confirm-ok").onclick = async () => {
          closeConfirm();
          showLoading("Deleting…");
          try {
            let action;
            if (type === "product") action = "deleteProduct";
            else if (type === "cat") action = "deleteCategory";
            else if (type === "subcat") action = "deleteSubCategory";
            else if (type === "subsubcat") action = "deleteSubSubCategory";
            else if (type === "delivery") action = "deleteDeliveryPrice";
            else if (type === "order") action = "deleteOrder";
            const r = await apiPost({ action, id });
            if (r.success) {
              showToast(
                cap(type === "subcat" ? "sub-category" : type === "subsubcat" ? "sub-subcategory" : type) + " deleted",
              );
              // Local mutation
              if (type === "product") {
                products = products.filter(p => p.id !== id);
                renderProducts();
                renderBundleList(document.getElementById("bundle-search")?.value || "");
                  } else if (type === "cat") {
                categories = categories.filter(c => c.id !== id);
                const removedSubIds = subCategories.filter(s => (s.categoryIds || []).includes(id)).map(s => s.id);
                subCategories = subCategories.filter(s => !(s.categoryIds || []).includes(id));
                subSubCategories = subSubCategories.filter(ss => !(ss.subCategoryIds || []).some(sid => removedSubIds.includes(sid)));
                renderCats();
                  } else if (type === "subcat") {
                subCategories = subCategories.filter(s => s.id !== id);
                subSubCategories = subSubCategories.filter(ss => !(ss.subCategoryIds || []).includes(id));
                renderCats();
                  } else if (type === "subsubcat") {
                subSubCategories = subSubCategories.filter(ss => ss.id !== id);
                renderCats();
                  } else if (type === "delivery") {
                deliveryPrices = deliveryPrices.filter(d => d.id !== id);
                renderDelivery();
                  } else if (type === "order") {
                document.getElementById("order-detail-modal").classList.remove("open");
                await Promise.all([_fetchDashOrders(), _fetchOrdersPage()]);
                renderOrders();
              }
              updateDashboard();
            } else showToast("Error: " + (r.error || "Unknown"), "error");
          } catch (e) {
            showToast("Error: " + e.message, "error");
          }
          hideLoading();
        };
        document.getElementById("confirm-overlay").classList.add("open");
      }
      function closeConfirm() {
        document.getElementById("confirm-overlay").classList.remove("open");
      }

      // ════════════════════════════════════════════
      // MULTI-SELECT DELETE
      // ════════════════════════════════════════════
      const _sel = {
        product: new Set(), cat: new Set(),
        delivery: new Set(), order: new Set()
      };

      function _selToggle(type, id, checked) {
        if (checked) _sel[type].add(id);
        else _sel[type].delete(id);
        _selUpdateBar(type);
        const cb = document.querySelector(`input.row-cb[data-sel-type="${type}"][data-sel-id="${id}"]`);
        if (cb && cb.closest("tr")) cb.closest("tr").classList.toggle("row-selected", checked);
      }

      function _selAll(type, checked) {
        const cbs = document.querySelectorAll(`input.row-cb[data-sel-type="${type}"]`);
        cbs.forEach(cb => {
          cb.checked = checked;
          const id = cb.dataset.selId;
          if (checked) _sel[type].add(id);
          else _sel[type].delete(id);
          if (cb.closest("tr")) cb.closest("tr").classList.toggle("row-selected", checked);
        });
        _selUpdateBar(type);
      }

      function _selUpdateBar(type) {
        const bar = document.getElementById("sel-bar-" + type);
        if (!bar) return;
        const n = _sel[type].size;
        bar.classList.toggle("visible", n > 0);
        const label = document.getElementById("sel-count-" + type);
        if (label) label.textContent = n + " " + (n !== 1 ? t('sel.items') : t('sel.item'));
        const allCb = document.getElementById("selall-" + type);
        if (allCb) {
          const total = document.querySelectorAll(`input.row-cb[data-sel-type="${type}"]`).length;
          allCb.indeterminate = n > 0 && n < total;
          allCb.checked = total > 0 && n === total;
        }
      }

      function _selReset(type) {
        _sel[type].clear();
        const bar = document.getElementById("sel-bar-" + type);
        if (bar) bar.classList.remove("visible");
        const allCb = document.getElementById("selall-" + type);
        if (allCb) { allCb.checked = false; allCb.indeterminate = false; }
      }

      function _selClear(type) {
        document.querySelectorAll(`input.row-cb[data-sel-type="${type}"]`).forEach(cb => {
          cb.checked = false;
          if (cb.closest("tr")) cb.closest("tr").classList.remove("row-selected");
        });
        _selReset(type);
      }

      async function deleteSelected(type) {
        const ids = [..._sel[type]];
        if (!ids.length) return;
        const n = ids.length;
        const labels = { product: "product", cat: "category", delivery: "delivery price", order: "order" };
        const typeLabel = labels[type] || type;
        document.getElementById("confirm-msg").textContent =
          "Delete " + n + " selected " + typeLabel + (n !== 1 ? "s" : "") + "? This cannot be undone.";
        document.getElementById("confirm-ok").onclick = async () => {
          closeConfirm();
          showLoading("Deleting " + n + " items…");
          const actionMap = { product: "deleteProduct", cat: "deleteCategory", delivery: "deleteDeliveryPrice", order: "deleteOrder" };
          const action = actionMap[type];
          let failed = 0;
          const deletedIds = [];
          for (const id of ids) {
            try {
              const r = await apiPost({ action, id });
              if (r.success) deletedIds.push(id);
              else failed++;
            } catch(e) { failed++; }
          }
          _selReset(type);
          const deletedSet = new Set(deletedIds);
          if (type === "product") {
            products = products.filter(p => !deletedSet.has(p.id));
            renderProducts();
            renderBundleList(document.getElementById("bundle-search")?.value || "");
          } else if (type === "cat") {
            categories = categories.filter(c => !deletedSet.has(c.id));
            subCategories = subCategories.filter(s => !(s.categoryIds || []).some(cid => deletedSet.has(cid)));
            renderCats();
          } else if (type === "delivery") {
            deliveryPrices = deliveryPrices.filter(d => !deletedSet.has(d.id));
            renderDelivery();
          } else if (type === "order") {
            await Promise.all([_fetchDashOrders(), _fetchOrdersPage()]);
            renderOrders();
          }
          updateDashboard();
          hideLoading();
          if (failed) showToast(failed + " item(s) failed to delete", "error");
          else showToast(n + " item" + (n !== 1 ? "s" : "") + " deleted");
        };
        document.getElementById("confirm-overlay").classList.add("open");
      }

      // ════════════════════════════════════════════
      // MODALS & TOAST
      // ════════════════════════════════════════════
      function openModal(id) {
        document.getElementById(id).classList.add("open");
      }
      function closeModal(id) {
        document.getElementById(id).classList.remove("open");
      }
      document.querySelectorAll(".modal-overlay").forEach((o) => {
        o.addEventListener("click", (e) => {
          if (e.target === o) o.classList.remove("open");
        });
      });
      let toastTimer;
      /* ── Rich Text Editor helpers ── */
      function rteCmd(cmd, edId) {
        const ed = document.getElementById(edId || "pm-desc-en");
        ed.focus();
        document.execCommand(cmd, false, null);
      }
      let _activeDescLang = "en";
      function activeDescId() { return "pm-desc-" + _activeDescLang; }
      function switchDescTab(lang) {
        _activeDescLang = lang;
        ["en","fr","ar"].forEach((l) => {
          document.getElementById("pm-desc-" + l).style.display = l === lang ? "" : "none";
          const tab = document.getElementById("desc-tab-" + l);
          if (tab) tab.classList.toggle("active", l === lang);
        });
        document.getElementById("pm-desc-" + lang).focus();
      }

      // Auto-upload pasted images in RTE fields to Cloudinary instead of embedding base64
      async function _rteUploadPastedImage(file, editorEl) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("upload_preset", CLOUDINARY_PRESET);
        fd.append("folder", "luxury-secret-products");
        try {
          const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, { method: "POST", body: fd });
          if (!res.ok) throw new Error();
          const data = await res.json();
          const img = document.createElement("img");
          img.src = data.secure_url;
          img.style.maxWidth = "100%";
          const sel = window.getSelection();
          if (sel.rangeCount) {
            const range = sel.getRangeAt(0);
            range.deleteContents();
            range.insertNode(img);
            range.setStartAfter(img);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
          } else {
            editorEl.appendChild(img);
          }
        } catch (e) {
          showToast("Image upload failed", "error");
        }
      }

      document.querySelectorAll(".rte-editor").forEach(function(ed) {
        ed.addEventListener("paste", function(e) {
          const items = (e.clipboardData || e.originalEvent.clipboardData).items;
          for (const item of items) {
            if (item.type.startsWith("image/")) {
              e.preventDefault();
              _rteUploadPastedImage(item.getAsFile(), ed);
              return;
            }
          }
        });
      });

      function showToast(msg, type = "success") {
        const t = document.getElementById("toast");
        document.getElementById("toast-msg").textContent = msg;
        t.className = "";
        t.classList.add("show");
        if (type === "error") t.classList.add("error");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => t.classList.remove("show"), 3000);
      }
      // ════════════════════════════════════════════
      // DELIVERY PRICES
      // ════════════════════════════════════════════
      function filterDelivery(q = "") {
        deliveryPage = 1;
        _delFilter = q.toLowerCase();
        renderDelivery(_delFilter);
      }

      function renderDelivery(filter = "") {
        _selReset("delivery");
        const tbody = document.getElementById("delivery-tbody");
        const pag = document.getElementById("delivery-pag");
        const filtered = deliveryPrices.filter(
          (d) => !filter || d.wilaya.toLowerCase().includes(filter),
        );
        if (!filtered.length) {
          tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><p>No delivery prices added yet</p></div></td></tr>`;
          if (pag) pag.innerHTML = "";
          return;
        }
        const pageStart = (deliveryPage - 1) * _PAGE;
        const pageItems = filtered.slice(pageStart, pageStart + _PAGE);
        tbody.innerHTML = pageItems
          .map(
            (d, idx) => `<tr>
          <td class="cb-td"><input type="checkbox" class="row-cb" data-sel-type="delivery" data-sel-id="${d.id}" onchange="_selToggle('delivery','${d.id}',this.checked)"></td>
          <td style="color:var(--g400);font-size:12px">${pageStart + idx + 1}</td>
          <td><strong>${d.wilaya}</strong></td>
          <td>${Number(d.homePrice).toLocaleString()} DA</td>
          <td>${Number(d.officePrice).toLocaleString()} DA</td>
          <td><div class="action-group">
            <button class="act-btn act-edit" onclick="editDelivery('${d.id}')">Edit</button>
            <button class="act-btn act-delete" onclick="confirmDelete('delivery','${d.id}')">Delete</button>
          </div></td>
        </tr>`,
          )
          .join("");
        if (pag) pag.innerHTML = _pagCtrl(filtered.length, deliveryPage, "setDeliveryPage");
      }

      function openDeliveryModal(id = null) {
        editingDeliveryId = id;
        document.getElementById("delivery-modal-title").textContent = id
          ? t('dm.editTitle')
          : t('dm.addTitle');
        if (id) {
          const d = deliveryPrices.find((x) => x.id === id);
          if (d) {
            document.getElementById("delivery-wilaya").value = d.wilaya;
            document.getElementById("delivery-home").value = d.homePrice;
            document.getElementById("delivery-office").value = d.officePrice;
          }
        } else {
          document.getElementById("delivery-wilaya").value = "";
          document.getElementById("delivery-home").value = "";
          document.getElementById("delivery-office").value = "";
        }
        openModal("delivery-modal");
      }

      function editDelivery(id) {
        openDeliveryModal(id);
      }

      async function saveDelivery() {
        const wilaya = document.getElementById("delivery-wilaya").value.trim();
        const homePrice = parseFloat(
          document.getElementById("delivery-home").value,
        );
        const officePrice = parseFloat(
          document.getElementById("delivery-office").value,
        );
        if (!wilaya) {
          showToast("Wilaya name required", "error");
          return;
        }
        if (isNaN(homePrice) || isNaN(officePrice)) {
          showToast("Both prices are required", "error");
          return;
        }
        const payload = {
          wilaya,
          homePrice,
          officePrice,
        };
        showLoading("Saving…");
        try {
          payload.action = editingDeliveryId
            ? "updateDeliveryPrice"
            : "addDeliveryPrice";
          if (editingDeliveryId) payload.id = editingDeliveryId;
          const r = await apiPost(payload);
          if (r.success) {
            showToast(
              editingDeliveryId ? "Delivery price updated!" : "Wilaya added!",
            );
            closeModal("delivery-modal");
            if (editingDeliveryId) {
              const idx = deliveryPrices.findIndex(d => d.id === editingDeliveryId);
              if (idx >= 0) deliveryPrices[idx] = { ...deliveryPrices[idx], wilaya, homePrice, officePrice };
            } else {
              deliveryPrices.push({ id: r.id || ("tmp_dp_" + Date.now()), wilaya, homePrice, officePrice });
            }
            renderDelivery();
          } else showToast("Error: " + (r.error || "Unknown"), "error");
        } catch (e) {
          showToast("Error: " + e.message, "error");
        }
        hideLoading();
      }

      function cap(s) {
        return s ? s[0].toUpperCase() + s.slice(1) : s;
      }

      // ════════════════════════════════════════════
      // BUNDLE — single product select
      // ════════════════════════════════════════════
      let bundleSelectedId = null;

      function renderBundleList(filter = "") {
        const list = document.getElementById("bundle-product-list");
        if (!list) return;
        const q = filter.toLowerCase();
        const filtered = products.filter(
          (p) =>
            !q ||
            (p.nameEn || p.name || "").toLowerCase().includes(q) ||
            (p.nameFr || "").toLowerCase().includes(q) ||
            (p.brandEn || p.brand || "").toLowerCase().includes(q) ||
            (p.brandFr || "").toLowerCase().includes(q),
        );
        if (!filtered.length) {
          list.innerHTML = `<div style="text-align:center;color:var(--g400);padding:32px 0;font-size:13px;">${
            products.length
              ? "No products match your search."
              : "No products yet. Add some first."
          }</div>`;
          return;
        }
        list.innerHTML = filtered
          .map((p) => {
            const sel = bundleSelectedId === p.id;
            const _bundleFirstImg = Array.isArray(p.imageUrl) ? p.imageUrl[0] : p.imageUrl;
            const imgHtml = _bundleFirstImg
              ? `<img src="${_bundleFirstImg}" alt="" />`
              : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>`;
            const displayName = _pLang(p);
            const displayBrand = _bLang(p);
            const safeName = displayName.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
            return `<div class="bundle-item${sel ? " selected" : ""}" onclick="selectBundleItem('${p.id}','${safeName}')">
            <div class="bundle-item-thumb">${imgHtml}</div>
            <div class="bundle-item-info">
              <div class="bundle-item-name">${displayName}</div>
              <div class="bundle-item-brand">${displayBrand || "No brand"}</div>
            </div>
            <div class="bundle-radio"></div>
          </div>`;
          })
          .join("");
      }

      function selectBundleItem(id, name) {
        bundleSelectedId = id;
        document.getElementById("bundle-selected-label").innerHTML =
          `Selected: <strong>${name}</strong>`;
        renderBundleList(document.getElementById("bundle-search")?.value || "");
      }

      function filterBundleProducts(q) {
        renderBundleList(q);
      }

      function clearBundle() {
        bundleSelectedId = null;
        document.getElementById("bundle-selected-label").textContent =
          "No product selected";
        renderBundleList(document.getElementById("bundle-search")?.value || "");
      }

      async function loadBundle() {
        try {
          const r = await apiGet("getBundle");
          if (r.success && r.bundleId) {
            bundleSelectedId = r.bundleId;
            const p = products.find((x) => x.id === r.bundleId);
            const lbl = document.getElementById("bundle-selected-label");
            if (lbl)
              lbl.innerHTML = p
                ? `Selected: <strong>${p.name}</strong>`
                : `Selected: <strong>${r.bundleId}</strong>`;
          }
          if (r.success) {
            const fields = {
              "bundle-title-en":       r.titleEn,
              "bundle-title-fr":       r.titleFr,
              "bundle-title-ar":       r.titleAr,
              "bundle-description-en": r.descriptionEn,
              "bundle-description-fr": r.descriptionFr,
              "bundle-description-ar": r.descriptionAr,
            };
            Object.entries(fields).forEach(([id, val]) => {
              const el = document.getElementById(id);
              if (el && val) el.value = val;
            });
          }
        } catch (e) {
          /* silent */
        }
        renderBundleList();
      }

      async function saveBundle() {
        showLoading("Saving bundle…");
        try {
          const g = (id) => (document.getElementById(id) || {}).value?.trim() || "";
          const r = await apiPost({
            action:        "saveBundle",
            bundleId:      bundleSelectedId || "",
            titleEn:       g("bundle-title-en"),
            titleFr:       g("bundle-title-fr"),
            titleAr:       g("bundle-title-ar"),
            descriptionEn: g("bundle-description-en"),
            descriptionFr: g("bundle-description-fr"),
            descriptionAr: g("bundle-description-ar"),
          });
          if (r.success) showToast("Bundle saved!");
          else showToast("Error: " + (r.error || "Unknown"), "error");
        } catch (e) {
          showToast("Error: " + e.message, "error");
        }
        hideLoading();
      }

      // ════════════════════════════════════════════
      // ORDERS
      // ════════════════════════════════════════════
      let ordersFilter = "all";
      let ordersSearch = "";
      let ordersSort = "date-desc";

      function searchOrders(val) {
        ordersSearch = val.trim().toLowerCase();
        orderPage = 1;
        _fetchOrdersPage().then(renderOrders).catch(() => renderOrders());
      }

      function sortOrders(val) {
        ordersSort = val;
        orderPage = 1;
        _fetchOrdersPage().then(renderOrders).catch(() => renderOrders());
      }

      async function loadOrders() {
        showLoading("Refreshing orders…");
        try {
          await Promise.all([_fetchDashOrders(), _fetchOrdersPage()]);
          renderOrders();
          updateDashboard();
          showToast("Orders refreshed");
        } catch (e) {
          showToast("Error: " + e.message, "error");
        }
        hideLoading();
      }

      function filterOrders(f, btn) {
        ordersFilter = f;
        orderPage = 1;
        document
          .querySelectorAll(".order-filter-btn")
          .forEach((b) => b.classList.remove("active"));
        if (btn) btn.classList.add("active");
        _fetchOrdersPage().then(renderOrders).catch(() => renderOrders());
      }

      function getOrderBadgeClass(status) {
        const map = {
          waiting: "badge-waiting",
          confirmed: "badge-confirmed",
          delivered: "badge-delivered",
          canceled: "badge-canceled",
        };
        return map[status] || "badge-waiting";
      }

      function renderOrders() {
        _selReset("order");
        const tbody = document.getElementById("orders-tbody");
        if (!tbody) return;

        // Filter button counts come from the full lightweight dataset
        const searchBase = ordersSearch
          ? _dashOrders.filter((o) => {
              const q = ordersSearch;
              return (
                `${o.firstName} ${o.lastName}`.toLowerCase().includes(q) ||
                (o.phone || "").toLowerCase().includes(q) ||
                (o.wilaya || "").toLowerCase().includes(q)
              );
            })
          : _dashOrders;

        document.querySelectorAll(".order-filter-btn").forEach((btn) => {
          const f = btn.dataset.filter;
          const countEl = btn.querySelector(".count");
          if (!countEl) return;
          countEl.textContent =
            f === "all"
              ? searchBase.length
              : searchBase.filter((o) => o.status === f).length;
        });

        if (!orders.length && ordersTotal === 0) {
          tbody.innerHTML = `<tr><td colspan="11"><div class="empty-state"><p>${t('orders.empty')}</p></div></td></tr>`;
          const pag = document.getElementById("orders-pag");
          if (pag) pag.innerHTML = "";
          return;
        }

        tbody.innerHTML = orders
          .map((o) => {
            const name = `${o.firstName} ${o.lastName}`.trim() || "—";
            const shortId = o.id ? o.id.slice(-8) : "—";
            const itemCount = Array.isArray(o.items) ? o.items.length : 0;
            let date = "—";
            if (o.createdAt) {
              try { date = new Date(o.createdAt).toLocaleDateString("en-GB"); } catch (e) {}
            }
            const badgeClass = getOrderBadgeClass(o.status);
            const safeId = o.id.replace(/'/g, "\\'");
            return `<tr>
              <td class="cb-td"><input type="checkbox" class="row-cb" data-sel-type="order" data-sel-id="${o.id}" onchange="_selToggle('order','${o.id}',this.checked)"></td>
              <td><span style="font-size:12px;color:var(--g400);font-family:monospace">#${shortId}</span></td>
              <td><div class="prod-name-block"><div class="name">${name}</div></div></td>
              <td>${o.phone || "—"}</td>
              <td style="font-size:12px">${o.wilaya || "—"}</td>
              <td style="font-size:12px">${o.address || "—"}</td>
              <td style="text-align:center">${itemCount}</td>
              <td><strong>${Number(o.total).toLocaleString("fr-DZ")} DA</strong></td>
              <td><span style="font-size:11px;color:var(--g400);background:var(--g100);padding:2px 7px;border-radius:4px">${o.source || "—"}</span></td>
              <td style="font-size:12px;color:var(--g600)">${date}</td>
              <td><span class="badge ${badgeClass}">${cap(o.status)}</span></td>
              <td><div class="action-group"><button class="act-btn act-view" onclick="openOrderDetail('${safeId}')">View More</button><button class="act-btn act-delete" onclick="confirmDelete('order','${safeId}')">Delete</button></div></td>
            </tr>`;
          })
          .join("");
        const pag = document.getElementById("orders-pag");
        if (pag) pag.innerHTML = _pagCtrl(ordersTotal, orderPage, "setOrderPage");
      }

      function openOrderDetail(id) {
        const o = orders.find((x) => x.id === id);
        if (!o) return;
        const safeId = id.replace(/'/g, "\\'");
        const itemsHtml = (o.items || [])
          .map(
            (it) => `<tr>
            <td>${it.name || "—"}</td>
            <td>${it.flavor || it.shade || "—"}</td>
            <td>${it.variant || "—"}</td>
            <td style="text-align:center">${it.qty || 1}</td>
            <td>${Number(it.unitPrice || 0).toLocaleString("fr-DZ")} DA</td>
            <td><strong>${Number(it.lineTotal || 0).toLocaleString("fr-DZ")} DA</strong></td>
          </tr>`,
          )
          .join("");

        document.getElementById("order-detail-body").innerHTML = `
          <div class="order-detail-section">
            <div class="order-detail-title">Customer Info</div>
            <div class="order-detail-grid">
              <div><span class="order-detail-label">Name</span><span>${o.firstName} ${o.lastName}</span></div>
              <div><span class="order-detail-label">Phone</span><span>${o.phone || "—"}</span></div>
              <div><span class="order-detail-label">Wilaya</span><span>${o.wilaya || "—"}</span></div>
              <div><span class="order-detail-label">Commune</span><span>${o.commune || "—"}</span></div>
              <div><span class="order-detail-label">Address</span><span>${o.address || "—"}</span></div>
              <div><span class="order-detail-label">Delivery Type</span><span>${o.deliveryType === "home" ? "🏠 Home Delivery" : "📦 Office Pickup"}</span></div>
              <div><span class="order-detail-label">Source</span><span>${o.source || "—"}</span></div>
            </div>
          </div>
          <div class="order-detail-section" id="order-items-section">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
              <div class="order-detail-title" style="margin-bottom:0">Ordered Items</div>
              <button class="act-btn act-edit" onclick="openEditOrderItems('${safeId}')" style="font-size:12px;padding:5px 12px">Edit Items</button>
            </div>
            <div id="order-items-view">
              <div class="table-wrap" style="margin-top:0">
                <table>
                  <thead><tr>
                    <th>Product</th><th>Shade / Color</th><th>Variant</th>
                    <th style="text-align:center">Qty</th><th>Unit Price</th><th>Line Total</th>
                  </tr></thead>
                  <tbody>${itemsHtml || '<tr><td colspan="6" style="text-align:center;color:var(--g400)">No items</td></tr>'}</tbody>
                </table>
              </div>
            </div>
          </div>
          <div class="order-detail-section">
            <div class="order-detail-title">Summary</div>
            <div class="order-detail-summary">
              <div class="summary-row"><span>Subtotal</span><span>${Number(o.subtotal || 0).toLocaleString("fr-DZ")} DA</span></div>
              <div class="summary-row"><span>Delivery (${o.deliveryType === "home" ? "Home" : "Office"})</span><span>${Number(o.deliveryCost || 0).toLocaleString("fr-DZ")} DA</span></div>
              <div class="summary-row total-row"><span>Total</span><strong>${Number(o.total || 0).toLocaleString("fr-DZ")} DA</strong></div>
            </div>
          </div>
          <div class="order-detail-section">
            <div class="order-detail-title">Update Status</div>
            <div class="order-status-btns" id="order-status-btns-${safeId}">
              <button class="status-btn status-waiting${o.status==='waiting'?' active':''}" onclick="updateOrderStatus('${safeId}','waiting')">⏳ Waiting</button>
              <button class="status-btn status-confirmed${o.status==='confirmed'?' active':''}" onclick="updateOrderStatus('${safeId}','confirmed')">✅ Confirmed</button>
              <button class="status-btn status-delivered${o.status==='delivered'?' active':''}" onclick="updateOrderStatus('${safeId}','delivered')">📦 Delivered</button>
              <button class="status-btn status-canceled${o.status==='canceled'?' active':''}" onclick="updateOrderStatus('${safeId}','canceled')">✖ Canceled</button>
            </div>
          </div>
          <div class="order-detail-section" style="padding-top:0">
            <button class="act-btn act-delete" style="width:100%;justify-content:center;padding:9px" onclick="confirmDelete('order','${safeId}')">Delete Order</button>
          </div>`;

        document.getElementById("order-detail-id").textContent =
          `Order #${id.slice(-8)}`;
        document.getElementById("order-detail-modal").classList.add("open");
      }

      // ════════════════════════════════════════════
      // EDIT ORDER ITEMS
      // ════════════════════════════════════════════
      function openEditOrderItems(id) {
        const o = orders.find(x => x.id === id);
        if (!o) return;
        editingOrderId = id;
        editingOrderItems = (o.items || []).map(it => ({ ...it }));
        _editAddProductId = null;
        _renderEditOrderItems();
      }

      function _renderEditOrderItems() {
        const section = document.getElementById('order-items-section');
        if (!section) return;

        const rowsHtml = editingOrderItems.map((it, idx) => `
          <tr>
            <td style="font-weight:600;font-size:13px">${it.name || '—'}</td>
            <td style="font-size:12px;color:var(--g400)">${it.flavor || it.shade || '—'}</td>
            <td style="font-size:12px;color:var(--g400)">${it.variant || '—'}</td>
            <td style="text-align:center">
              <div class="eoi-qty-wrap">
                <button class="eoi-qty-btn" onclick="changeEditItemQty(${idx},-1)">−</button>
                <span class="eoi-qty-val">${it.qty || 1}</span>
                <button class="eoi-qty-btn" onclick="changeEditItemQty(${idx},1)">+</button>
              </div>
            </td>
            <td style="font-size:13px">${Number(it.unitPrice||0).toLocaleString('fr-DZ')} DA</td>
            <td style="font-size:13px;font-weight:600">${Number(it.lineTotal||0).toLocaleString('fr-DZ')} DA</td>
            <td><button class="eoi-del-btn" onclick="removeEditItem(${idx})" title="Remove">×</button></td>
          </tr>`).join('');

        // Add product search UI
        const prod = _editAddProductId ? products.find(p => p.id === _editAddProductId) : null;
        const variantOptions = prod && prod.variants && prod.variants.length
          ? prod.variants.map((v,i) => `<option value="${i}">${v.label || v.weight+v.unit} — ${Number(v.price||0).toLocaleString('fr-DZ')} DA</option>`).join('')
          : '';
        const flavorOptions = prod && prod.flavors && prod.flavors.length
          ? ['<option value="">No shade</option>', ...prod.flavors.map(f => `<option value="${f.name||f}">${f.name||f}</option>`)].join('')
          : '';

        section.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <div class="order-detail-title" style="margin-bottom:0">Edit Items</div>
          </div>
          <div class="table-wrap" style="margin-top:0">
            <table>
              <thead><tr>
                <th>Product</th><th>Flavor</th><th>Variant</th>
                <th style="text-align:center">Qty</th><th>Unit Price</th><th>Total</th><th></th>
              </tr></thead>
              <tbody>${rowsHtml || '<tr><td colspan="7" style="text-align:center;color:var(--g400);padding:16px">No items — add products below</td></tr>'}</tbody>
            </table>
          </div>

          <div class="eoi-add-section">
            <div class="eoi-add-title">Add a Product</div>
            <div class="eoi-search-wrap">
              <input class="form-control" id="eoi-product-search" type="text" placeholder="Search product by name…"
                oninput="onEditProductSearch(this.value)" autocomplete="off" />
              <div class="eoi-search-drop" id="eoi-search-drop"></div>
            </div>
            ${prod ? `
            <div class="eoi-product-opts" id="eoi-product-opts">
              <div class="eoi-product-name">${prod.name}${prod.brand ? ' <span style="color:var(--g400);font-weight:400">· '+prod.brand+'</span>' : ''}</div>
              <div class="eoi-opts-row">
                ${variantOptions ? `<div class="eoi-opt-group"><label>Variant</label><select class="form-control" id="eoi-variant-sel">${variantOptions}</select></div>` : ''}
                ${flavorOptions ? `<div class="eoi-opt-group"><label>Shade / Color</label><select class="form-control" id="eoi-flavor-sel">${flavorOptions}</select></div>` : ''}
                <div class="eoi-opt-group"><label>Qty</label><input type="number" class="form-control" id="eoi-add-qty" value="1" min="1" style="width:70px" /></div>
                <button class="act-btn act-confirm" onclick="addItemToEditOrder()" style="align-self:flex-end;padding:8px 16px;font-size:13px">Add</button>
              </div>
            </div>` : ''}
          </div>

          <div class="eoi-actions">
            <button class="act-btn act-confirm" onclick="saveOrderItems()" style="padding:9px 24px;font-size:13px;font-weight:600">Save Changes</button>
            <button class="act-btn" onclick="cancelEditOrderItems()" style="padding:9px 16px;font-size:13px">Cancel</button>
          </div>`;
      }

      function onEditProductSearch(val) {
        const drop = document.getElementById('eoi-search-drop');
        if (!drop) return;
        const q = val.trim().toLowerCase();
        if (!q) { drop.innerHTML = ''; drop.classList.remove('open'); return; }
        const matches = products.filter(p => !p.hidden && p.status === 'active' &&
          ((p.name||'').toLowerCase().includes(q) || (p.brand||'').toLowerCase().includes(q))
        ).slice(0, 8);
        if (!matches.length) { drop.innerHTML = '<div class="eoi-drop-empty">No products found</div>'; drop.classList.add('open'); return; }
        drop.innerHTML = matches.map(p =>
          `<div class="eoi-drop-item" onclick="selectEditProduct('${p.id.replace(/'/g,"\\'")}')">
            <span class="eoi-drop-name">${p.name}</span>
            ${p.brand ? `<span class="eoi-drop-brand">${p.brand}</span>` : ''}
          </div>`
        ).join('');
        drop.classList.add('open');
      }

      function selectEditProduct(id) {
        _editAddProductId = id;
        const drop = document.getElementById('eoi-search-drop');
        if (drop) { drop.innerHTML = ''; drop.classList.remove('open'); }
        const input = document.getElementById('eoi-product-search');
        const p = products.find(x => x.id === id);
        if (input && p) input.value = p.name;
        _renderEditOrderItems();
        // re-populate search input after re-render
        const inp2 = document.getElementById('eoi-product-search');
        if (inp2 && p) inp2.value = p.name;
      }

      function addItemToEditOrder() {
        const prod = _editAddProductId ? products.find(p => p.id === _editAddProductId) : null;
        if (!prod) { showToast('Select a product first', 'error'); return; }
        const variantSel = document.getElementById('eoi-variant-sel');
        const flavorSel = document.getElementById('eoi-flavor-sel');
        const qtyInput = document.getElementById('eoi-add-qty');
        const qty = Math.max(1, parseInt(qtyInput?.value) || 1);

        let variantLabel = '';
        let unitPrice = 0;
        if (variantSel && prod.variants && prod.variants.length) {
          const v = prod.variants[parseInt(variantSel.value) || 0];
          variantLabel = v ? (v.label || (v.weight + v.unit)) : '';
          unitPrice = v ? (Number(v.price) || 0) : 0;
        } else if (prod.variants && prod.variants.length) {
          const v = prod.variants[0];
          variantLabel = v ? (v.label || (v.weight + v.unit)) : '';
          unitPrice = v ? (Number(v.price) || 0) : 0;
        }

        // Apply discount if product has one
        if (prod.discount && Number(prod.discount) > 0) {
          unitPrice = unitPrice - (unitPrice * Number(prod.discount) / 100);
        }

        const flavorName = flavorSel ? flavorSel.value : '';

        editingOrderItems.push({
          name: prod.name,
          brand: prod.brand || '',
          productId: prod.id,
          variant: variantLabel,
          flavor: flavorName,
          qty,
          unitPrice,
          lineTotal: unitPrice * qty,
        });

        _editAddProductId = null;
        _renderEditOrderItems();
        showToast('Product added');
      }

      function changeEditItemQty(idx, delta) {
        const item = editingOrderItems[idx];
        if (!item) return;
        item.qty = Math.max(1, (item.qty || 1) + delta);
        item.lineTotal = item.unitPrice * item.qty;
        _renderEditOrderItems();
      }

      function removeEditItem(idx) {
        editingOrderItems.splice(idx, 1);
        _renderEditOrderItems();
      }

      async function saveOrderItems() {
        if (!editingOrderId) return;
        const o = orders.find(x => x.id === editingOrderId);
        if (!o) return;
        showLoading('Saving order…');
        try {
          const subtotal = editingOrderItems.reduce((s, it) => s + (it.lineTotal || 0), 0);
          const total = subtotal + (o.deliveryCost || 0) - (o.promoDiscount || 0);
          const { error } = await sb.from('orders').update({
            items: editingOrderItems,
            subtotal,
            total,
          }).eq('id', editingOrderId);
          if (error) throw error;
          // Update local cache
          o.items = editingOrderItems;
          o.subtotal = subtotal;
          o.total = total;
          const d = _dashOrders.find(x => x.id === editingOrderId);
          if (d) { d.items = editingOrderItems; d.total = total; }
          const savedId = editingOrderId;
          editingOrderId = null;
          editingOrderItems = [];
          _editAddProductId = null;
          renderOrders();
          updateDashboard();
          openOrderDetail(savedId);
          showToast('Order updated!');
        } catch (e) {
          showToast('Error: ' + e.message, 'error');
        }
        hideLoading();
      }

      function cancelEditOrderItems() {
        if (!editingOrderId) return;
        const id = editingOrderId;
        editingOrderId = null;
        editingOrderItems = [];
        _editAddProductId = null;
        openOrderDetail(id);
      }

      async function toggleProductVisibility(id, hidden) {
        showLoading(hidden ? "Making visible…" : "Hiding product…");
        try {
          const { error } = await sb.from("products").update({ hidden: !hidden }).eq("id", id);
          if (error) throw error;
          const p = products.find(x => x.id === id);
          if (p) p.hidden = !hidden;
          renderProducts(_prodFilter);
          showToast(hidden ? "Product is now visible on the store" : "Product hidden from the store");
        } catch(e) {
          showToast("Error: " + e.message, "error");
        }
        hideLoading();
      }

      async function updateOrderStatus(id, status) {
        showLoading("Updating status…");
        try {
          const r = await apiPost({ action: "updateOrderStatus", id, status });
          if (r.success) {
            // Update both caches optimistically
            const o = orders.find((x) => x.id === id);
            if (o) o.status = status;
            const d = _dashOrders.find((x) => x.id === id);
            if (d) d.status = status;
            // Update buttons in modal
            const safeId = id.replace(/'/g, "\\'");
            const container = document.getElementById(`order-status-btns-${safeId}`);
            if (container) {
              container.querySelectorAll(".status-btn").forEach((b) => {
                b.classList.remove("active");
                if (b.classList.contains(`status-${status}`)) b.classList.add("active");
              });
            }
            renderOrders();
            updateDashboard();
            showToast("Status updated to " + cap(status) + "!");
          } else showToast("Error: " + (r.error || "Unknown"), "error");
        } catch (e) {
          showToast("Error: " + e.message, "error");
        }
        hideLoading();
      }
