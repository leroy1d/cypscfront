import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  FiEdit, FiTrash2, FiPlus, FiSearch, FiEye, FiEyeOff, FiCalendar,
  FiDollarSign, FiFileText, FiImage, FiVideo, FiUser, FiMessageSquare,
  FiBarChart2, FiGlobe, FiSettings, FiUpload, FiCheck, FiX, FiList,
  FiTag, FiPercent, FiMapPin, FiCheckCircle, FiClock, FiStar, FiRefreshCw,
  FiDownload, FiShare2, FiFilter, FiChevronDown, FiChevronUp, FiXCircle,
  FiLink, FiCopy, FiGrid, FiThumbsUp
} from 'react-icons/fi';
import { FaUsers, FaHandshake, FaChartLine, FaRecycle } from 'react-icons/fa';

const GestionContenu = () => {
  const [activeTab, setActiveTab] = useState('actions');
  const [data, setData] = useState({
    actions: [],
    articles: [],
    categories: [],
    temoignages: [],
    faq: [],
    statistiques: [],
    evenements: [],
    parametres: [],
    medias: []
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('tous');
  const [filterCategorie, setFilterCategorie] = useState('tous');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [expandedItem, setExpandedItem] = useState(null);
  const [mediaGallery, setMediaGallery] = useState([]);
  const fileInputRef = useRef(null);

  // Dans votre composant, ajoutez ces states
const [selectedFile, setSelectedFile] = useState(null);
const [previewUrl, setPreviewUrl] = useState('');
const [isUploading, setIsUploading] = useState(false);

// Fonction pour gérer la sélection du fichier
const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    // Vérifier le type de fichier
    if (!file.type.match('image.*')) {
      alert('Veuillez sélectionner une image (JPEG, PNG, etc.)');
      return;
    }
    
    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 5MB');
      return;
    }

    setSelectedFile(file);
    
    // Créer une URL de prévisualisation
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  }
};

// Fonction pour uploader l'image
const uploadImage = async () => {
  if (!selectedFile) return;

  setIsUploading(true);
  setUploadProgress(0);

  const formData = new FormData();
  formData.append('image', selectedFile);

  try {
    const response = await fetch('http://localhost:5005/api/upload/image', {
      method: 'POST',
      body: formData,
      // Suivi de la progression
      onUploadProgress: (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(progress);
      }
    });

    if (response.ok) {
      const data = await response.json();
      // Mettre à jour le formulaire avec l'URL de l'image uploadée
      handleInputChange({
        target: {
          name: 'photo_url',
          value: data.image_url // L'URL retournée par le serveur
        }
      });
      
      // Réinitialiser l'état de l'upload
      setSelectedFile(null);
      setPreviewUrl('');
      setUploadProgress(100);
      
      // Message de succès
      alert('Image uploadée avec succès !');
    } else {
      throw new Error('Erreur lors de l\'upload');
    }
  } catch (error) {
    console.error('Erreur upload:', error);
    alert('Erreur lors de l\'upload de l\'image');
  } finally {
    setIsUploading(false);
    setTimeout(() => setUploadProgress(0), 2000);
  }
};

  // Nouveaux états pour le mode d'upload
  const [uploadMode, setUploadMode] = useState('device'); // 'device' ou 'url'
  const [urlUploads, setUrlUploads] = useState(['']);
  const [urlUploadData, setUrlUploadData] = useState({
    titre: '',
    description: ''
  });

  // États pour la galerie
  const [galleryViewMode, setGalleryViewMode] = useState('grid');
  const [galleryFilterType, setGalleryFilterType] = useState('all');
  const [currentGalleryPage, setCurrentGalleryPage] = useState(1);
  const [gallerySearchTerm, setGallerySearchTerm] = useState('');
  const [selectedGalleryMedia, setSelectedGalleryMedia] = useState(null);
  const galleryItemsPerPage = 12;

  // Types de médias pour la galerie
  const galleryMediaTypes = [
    { id: 'all', label: 'Tous les médias', icon: <FiGrid /> },
    { id: 'image', label: 'Images', icon: <FiImage /> },
    { id: 'video', label: 'Vidéos', icon: <FiVideo /> },
    { id: 'featured', label: 'À la une', icon: <FiStar /> }
  ];

  const getFilteredGalleryItems = () => {
    let filtered = [...data.medias];

    if (galleryFilterType !== 'all') {
      if (galleryFilterType === 'featured') {
        filtered = filtered.filter(media => media.is_featured);
      } else {
        filtered = filtered.filter(media => media.type === galleryFilterType);
      }
    }

    if (gallerySearchTerm) {
      const term = gallerySearchTerm.toLowerCase();
      filtered = filtered.filter(media =>
        (media.titre && media.titre.toLowerCase().includes(term)) ||
        (media.description && media.description.toLowerCase().includes(term))
      );
    }

    return filtered;
  };

  const galleryPagination = () => {
    const filtered = getFilteredGalleryItems();
    const totalPages = Math.ceil(filtered.length / galleryItemsPerPage);
    const startIndex = (currentGalleryPage - 1) * galleryItemsPerPage;
    const endIndex = startIndex + galleryItemsPerPage;

    return {
      items: filtered.slice(startIndex, endIndex),
      totalPages,
      currentPage: currentGalleryPage,
      totalItems: filtered.length,
      startIndex: startIndex + 1,
      endIndex: Math.min(endIndex, filtered.length)
    };
  };

  // États de formulaire
  const [formData, setFormData] = useState({
    // Actions/Projets
    titre: '',
    description: '',
    type: 'developpement',
    categorie_id: '',
    date_debut: '',
    date_fin: '',
    budget: '',
    statut: 'planifie',
    pays: '',
    localisation: '',
    partenaires: '',
    photos: '',
    videos: '',
    is_featured: false,
    ordre: 0,

    // Articles
    contenu: '',
    auteur: '',
    categorie_article: '',
    image_url: '',
    images: '',
    resume: '',
    mots_cles: '',
    publie: false,
    vues: 0,
    likes: 0,

    // Catégories
    nom_categorie: '',
    description_categorie: '',
    icone: 'fas fa-folder',
    couleur: '#3498DB',
    ordre_categorie: 0,

    // Témoignages
    nom_temoignage: '',
    fonction: '',
    pays_temoignage: '',
    contenu_temoignage: '',
    note: 5,
    projet_id: '',
    photo_url: '',
    approuve: false,

    // FAQ
    question: '',
    reponse: '',
    categorie_faq: 'general',
    ordre_faq: 0,
    actif: true,

    // Statistiques
    annee: new Date().getFullYear(),
    type_stat: 'impact',
    valeur: '',
    label: '',
    description_stat: '',
    categorie_stat: '',

    // Événements
    titre_event: '',
    description_event: '',
    type_event: 'action',
    date_debut_event: '',
    date_fin_event: '',
    lieu: '',
    statut_event: 'planifie',
    projet_id_event: '',
    images_event: '',

    // Paramètres
    cle_param: '',
    valeur_param: '',
    type_param: 'texte',
    description_param: '',

    // Médias
    titre_media: '',
    description_media: '',
    type_media: 'image',
    url_media: '',
    projet_id_media: '',
    article_id_media: '',
    is_featured_media: false,
    ordre_media: 0
  });

  // Constantes pour les options
  const typeOptions = [
    { value: 'urgence', label: 'Urgence', color: '#e74c3c' },
    { value: 'developpement', label: 'Développement', color: '#3498db' },
    { value: 'education', label: 'Éducation', color: '#f39c12' },
    { value: 'sante', label: 'Santé', color: '#2ecc71' },
    { value: 'eau', label: 'Eau', color: '#1abc9c' },
    { value: 'alimentaire', label: 'Aide alimentaire', color: '#e67e22' }
  ];

  const statutOptions = [
    { value: 'planifie', label: 'Planifié', color: '#f39c12' },
    { value: 'en_cours', label: 'En cours', color: '#3498db' },
    { value: 'termine', label: 'Terminé', color: '#2ecc71' },
    { value: 'suspendu', label: 'Suspendu', color: '#e74c3c' },
    { value: 'annule', label: 'Annulé', color: '#95a5a6' }
  ];

  const categorieFAQOptions = [
    { value: 'general', label: 'Général' },
    { value: 'dons', label: 'Dons & Financement' },
    { value: 'actions', label: 'Nos Actions' },
    { value: 'transparence', label: 'Transparence' },
    { value: 'engagement', label: 'Engagement' },
    { value: 'benevolat', label: 'Bénévolat' },
    { value: 'partenariats', label: 'Partenariats' }
  ];

  useEffect(() => {
    fetchData();
    if (showUploadModal || activeTab === 'medias') {
      fetchMediaGallery();
    }
  }, [activeTab, showUploadModal]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const endpoints = {
        actions: '/api/actions',
        articles: '/api/articles',
        categories: '/api/categories',
        temoignages: '/api/temoignages',
        faq: '/api/faq',
        statistiques: `/api/statistiques/${new Date().getFullYear()}`,
        evenements: '/api/evenements',
        parametres: '/api/parametres',
        medias: '/api/medias?limit=50'
      };

      const results = {};
      for (const [key, endpoint] of Object.entries(endpoints)) {
        try {
          const response = await axios.get(endpoint);
          results[key] = response.data;
        } catch (error) {
          console.error(`Erreur chargement ${key}:`, error);
          results[key] = [];
        }
      }

      setData(results);
    } catch (error) {
      console.error('Erreur générale:', error);
      alert('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const fetchMediaGallery = async () => {
    try {
      const response = await axios.get('/api/gallery');
      setMediaGallery(response.data.items);
    } catch (error) {
      console.error('Erreur chargement galerie:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTextareaChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditClick = (item, type = activeTab) => {
    setCurrentItem({ ...item, itemType: type });

    const baseData = {
      titre: item.titre || '',
      description: item.description || '',
      type: item.type || 'developpement',
      categorie_id: item.categorie_id || '',
      date_debut: item.date_debut ? item.date_debut.split('T')[0] : '',
      date_fin: item.date_fin ? item.date_fin.split('T')[0] : '',
      budget: item.budget || '',
      statut: item.statut || 'planifie',
      pays: item.pays || '',
      localisation: item.localisation || '',
      partenaires: item.partenaires || '',
      photos: item.photos || '',
      videos: item.videos || '',
      is_featured: item.is_featured || false,
      ordre: item.ordre || 0,

      contenu: item.contenu || '',
      auteur: item.auteur || '',
      categorie_article: item.categorie || '',
      image_url: item.image_url || '',
      images: item.images || '',
      resume: item.resume || '',
      mots_cles: item.mots_cles || '',
      publie: item.publie || false,
      vues: item.vues || 0,
      likes: item.likes || 0,

      nom_categorie: item.nom || '',
      description_categorie: item.description || '',
      icone: item.icone || 'fas fa-folder',
      couleur: item.couleur || '#3498DB',
      ordre_categorie: item.ordre || 0,

      nom_temoignage: item.nom || '',
      fonction: item.fonction || '',
      pays_temoignage: item.pays || '',
      contenu_temoignage: item.contenu || '',
      note: item.note || 5,
      projet_id: item.projet_id || '',
      photo_url: item.photo_url || '',
      approuve: item.approuve || false,

      question: item.question || '',
      reponse: item.reponse || '',
      categorie_faq: item.categorie || 'general',
      ordre_faq: item.ordre || 0,
      actif: item.actif !== undefined ? item.actif : true,

      annee: item.annee || new Date().getFullYear(),
      type_stat: item.type || 'impact',
      valeur: item.valeur || '',
      label: item.label || '',
      description_stat: item.description || '',
      categorie_stat: item.categorie || '',

      titre_event: item.titre || '',
      description_event: item.description || '',
      type_event: item.type || 'action',
      date_debut_event: item.date_debut ? item.date_debut.split('T')[0] : '',
      date_fin_event: item.date_fin ? item.date_fin.split('T')[0] : '',
      lieu: item.lieu || '',
      statut_event: item.statut || 'planifie',
      projet_id_event: item.projet_id || '',
      images_event: item.images || '',

      cle_param: item.cle || '',
      valeur_param: item.valeur || '',
      type_param: item.type || 'texte',
      description_param: item.description || '',

      titre_media: item.titre || '',
      description_media: item.description || '',
      type_media: item.type || 'image',
      url_media: item.url || '',
      projet_id_media: item.projet_id || '',
      article_id_media: item.article_id || '',
      is_featured_media: item.is_featured || false,
      ordre_media: item.ordre || 0
    };

    setFormData(baseData);
    setShowModal(true);
  };

  const handleDeleteClick = (item, type = activeTab) => {
    setCurrentItem({ ...item, itemType: type });
    setShowDeleteModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const itemType = currentItem?.itemType || activeTab;
      let endpoint = '';
      let method = currentItem ? 'put' : 'post';
      let payload = {};

      switch (itemType) {
        case 'actions':
          endpoint = currentItem ? `/api/actions/${currentItem.id}` : '/api/actions';
          payload = {
            titre: formData.titre,
            description: formData.description,
            type: formData.type,
            date_debut: formData.date_debut,
            date_fin: formData.date_fin,
            budget: formData.budget,
            statut: formData.statut,
            photos: formData.photos,
            videos: formData.videos,
            pays: formData.pays,
            localisation: formData.localisation,
            partenaires: formData.partenaires,
            is_featured: formData.is_featured,
            ordre: formData.ordre
          };
          break;

        case 'articles':
          endpoint = currentItem ? `/api/articles/${currentItem.id}` : '/api/articles';
          payload = {
            titre: formData.titre,
            contenu: formData.contenu,
            auteur: formData.auteur,
            categorie: formData.categorie_article,
            image_url: formData.image_url,
            images: formData.images,
            resume: formData.resume,
            mots_cles: formData.mots_cles,
            publie: formData.publie,
            vues: formData.vues,
            likes: formData.likes,
            is_featured: formData.is_featured
          };
          break;

        case 'categories':
          endpoint = currentItem ? `/api/categories/${currentItem.id}` : '/api/categories';
          payload = {
            nom: formData.nom_categorie,
            description: formData.description_categorie,
            icone: formData.icone,
            couleur: formData.couleur,
            ordre: formData.ordre_categorie
          };
          break;

        case 'temoignages':
          endpoint = currentItem ? `/api/temoignages/${currentItem.id}` : '/api/temoignages';
          payload = {
            nom: formData.nom_temoignage,
            fonction: formData.fonction,
            pays: formData.pays_temoignage,
            contenu: formData.contenu_temoignage,
            note: formData.note,
            projet_id: formData.projet_id,
            photo_url: formData.photo_url,
            approuve: formData.approuve
          };
          break;

        case 'faq':
          endpoint = currentItem ? `/api/faq/${currentItem.id}` : '/api/faq';
          payload = {
            question: formData.question,
            reponse: formData.reponse,
            categorie: formData.categorie_faq,
            ordre: formData.ordre_faq,
            actif: formData.actif
          };
          break;

        case 'statistiques':
          endpoint = '/api/statistiques';
          method = 'post';
          payload = {
            annee: formData.annee,
            type: formData.type_stat,
            valeur: formData.valeur,
            label: formData.label,
            description: formData.description_stat,
            categorie: formData.categorie_stat
          };
          break;

        case 'evenements':
          endpoint = currentItem ? `/api/evenements/${currentItem.id}` : '/api/evenements';
          payload = {
            titre: formData.titre_event,
            description: formData.description_event,
            type: formData.type_event,
            date_debut: formData.date_debut_event,
            date_fin: formData.date_fin_event,
            lieu: formData.lieu,
            statut: formData.statut_event,
            projet_id: formData.projet_id_event,
            images: formData.images_event
          };
          break;

        case 'medias':
          endpoint = currentItem ? `/api/medias/${currentItem.id}` : '/api/medias';
          payload = {
            titre: formData.titre_media,
            description: formData.description_media,
            type: formData.type_media,
            url: formData.url_media,
            projet_id: formData.projet_id_media,
            article_id: formData.article_id_media,
            is_featured: formData.is_featured_media,
            ordre: formData.ordre_media
          };
          break;
      }

      if (method === 'post') {
        await axios.post(endpoint, payload);
      } else {
        await axios.put(endpoint, payload);
      }

      alert(`${currentItem ? 'Modifié' : 'Créé'} avec succès!`);
      setShowModal(false);
      setCurrentItem(null);
      resetForm();
      fetchData();

    } catch (error) {
      console.error('Erreur:', error);
      alert(`Erreur: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleDelete = async () => {
    try {
      const itemType = currentItem.itemType;
      let endpoint = '';

      switch (itemType) {
        case 'actions': endpoint = `/api/actions/${currentItem.id}`; break;
        case 'articles': endpoint = `/api/articles/${currentItem.id}`; break;
        case 'categories': endpoint = `/api/categories/${currentItem.id}`; break;
        case 'temoignages': endpoint = `/api/temoignages/${currentItem.id}`; break;
        case 'faq': endpoint = `/api/faq/${currentItem.id}`; break;
        case 'evenements': endpoint = `/api/evenements/${currentItem.id}`; break;
        case 'medias': endpoint = `/api/medias/${currentItem.id}`; break;
        case 'statistiques': endpoint = `/api/statistiques/${currentItem.id}`; break;
      }

      await axios.delete(endpoint);
      alert('Supprimé avec succès!');
      setShowDeleteModal(false);
      setCurrentItem(null);
      fetchData();

    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setFormData({
      titre: '', description: '', type: 'developpement', categorie_id: '',
      date_debut: '', date_fin: '', budget: '', statut: 'planifie',
      pays: '', localisation: '', partenaires: '', photos: '', videos: '', is_featured: false,
      ordre: 0, contenu: '', auteur: '', categorie_article: '', image_url: '',
      images: '', resume: '', mots_cles: '', publie: false, vues: 0, likes: 0,
      nom_categorie: '', description_categorie: '', icone: 'fas fa-folder',
      couleur: '#3498DB', ordre_categorie: 0, nom_temoignage: '', fonction: '',
      pays_temoignage: '', contenu_temoignage: '', note: 5, projet_id: '',
      photo_url: '', approuve: false, question: '', reponse: '', categorie_faq: 'general',
      ordre_faq: 0, actif: true, annee: new Date().getFullYear(), type_stat: 'impact',
      valeur: '', label: '', description_stat: '', categorie_stat: '', titre_event: '',
      description_event: '', type_event: 'action', date_debut_event: '', date_fin_event: '',
      lieu: '', statut_event: 'planifie', projet_id_event: '', images_event: '', cle_param: '',
      valeur_param: '', type_param: 'texte', description_param: '', titre_media: '',
      description_media: '', type_media: 'image', url_media: '', projet_id_media: '',
      article_id_media: '', is_featured_media: false, ordre_media: 0
    });
    setUploadedFiles([]);
    setUrlUploads(['']);
    setUrlUploadData({ titre: '', description: '' });
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    const uploadFormData = new FormData();
    Array.from(files).forEach(file => {
      uploadFormData.append('files', file);
    });

    try {
      setUploading(true);
      setUploadProgress(0);

      const response = await axios.post('/api/upload/multiple', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      });

      const uploaded = response.data.files;
      setUploadedFiles(prev => [...prev, ...uploaded]);

      // Mettre à jour les URLs des photos dans le state formData
      const imageUrls = uploaded.filter(f => f.type.includes('image')).map(f => f.url);

      if (imageUrls.length > 0) {
        // Pour les articles, mettre à jour image_url et images
        if (activeTab === 'articles') {
          // Si pas d'image principale, utiliser la première comme image_url
          if (!formData.image_url && imageUrls.length > 0) {
            setFormData(prev => ({
              ...prev,
              image_url: imageUrls[0]
            }));
          }

          // Ajouter aux images supplémentaires
          const currentImages = formData.images ? formData.images.split(',').filter(Boolean) : [];
          const newImages = [...currentImages, ...imageUrls].join(',');

          setFormData(prev => ({
            ...prev,
            images: newImages
          }));
        }
        // Pour les actions, mettre à jour photos
        else if (activeTab === 'actions') {
          const currentPhotos = formData.photos ? formData.photos.split(',').filter(Boolean) : [];
          const newPhotos = [...currentPhotos, ...imageUrls].join(',');

          setFormData(prev => ({
            ...prev,
            photos: newPhotos
          }));
        }
        // Pour les événements, mettre à jour images_event
        else if (activeTab === 'evenements') {
          const currentImages = formData.images_event ? formData.images_event.split(',').filter(Boolean) : [];
          const newImages = [...currentImages, ...imageUrls].join(',');

          setFormData(prev => ({
            ...prev,
            images_event: newImages
          }));
        }
      }

      // Mettre à jour les URLs des vidéos
      const videoUrls = uploaded.filter(f => f.type.includes('video')).map(f => f.url);

      if (videoUrls.length > 0) {
        if (activeTab === 'actions') {
          const currentVideos = formData.videos ? formData.videos.split(',').filter(Boolean) : [];
          const newVideos = [...currentVideos, ...videoUrls].join(',');

          setFormData(prev => ({
            ...prev,
            videos: newVideos
          }));
        }
      }

      alert(`${uploaded.length} fichier(s) uploadé(s) avec succès!`);
      fetchMediaGallery();
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors de l\'upload des fichiers: ' + (error.response?.data?.error || error.message));
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUrlUpload = async (urls) => {
    try {
      const validUrls = urls.filter(url => url.trim() !== '');
      if (validUrls.length === 0) return;

      setUploading(true);
      setUploadProgress(0);

      const uploadPromises = validUrls.map(async (url, index) => {
        const data = {
          url: url.trim(),
          titre: urlUploadData.titre || `Media ${index + 1}`,
          description: urlUploadData.description || '',
          type: determineMediaType(url)
        };

        const response = await fetch('https://ypsbackend.vercel.app/api/media/url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error(`Erreur upload URL: ${response.status}`);
        return response.json();
      });

      const results = await Promise.all(uploadPromises);

      const uploaded = results.map(result => ({
        url: result.url,
        originalName: result.titre || 'Media URL',
        type: result.type || 'image',
        size: result.size || 'N/A'
      }));

      setUploadedFiles(prev => [...prev, ...uploaded]);

      // Mettre à jour le formulaire avec les URLs
      const imageUrls = uploaded.filter(f => f.type === 'image').map(f => f.url);

      if (imageUrls.length > 0) {
        if (activeTab === 'articles') {
          if (!formData.image_url && imageUrls.length > 0) {
            setFormData(prev => ({
              ...prev,
              image_url: imageUrls[0]
            }));
          }

          const currentImages = formData.images ? formData.images.split(',').filter(Boolean) : [];
          const newImages = [...currentImages, ...imageUrls].join(',');

          setFormData(prev => ({
            ...prev,
            images: newImages
          }));
        } else if (activeTab === 'actions') {
          const currentPhotos = formData.photos ? formData.photos.split(',').filter(Boolean) : [];
          const newPhotos = [...currentPhotos, ...imageUrls].join(',');

          setFormData(prev => ({
            ...prev,
            photos: newPhotos
          }));
        }
      }

      alert(`${results.length} média(s) uploadé(s) via URL avec succès!`);

      // Réinitialiser les URLs
      setUrlUploads(['']);
      setUrlUploadData({ titre: '', description: '' });
      fetchMediaGallery();

    } catch (error) {
      console.error('Erreur upload URL:', error);
      alert('Erreur lors de l\'upload via URL: ' + error.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const determineMediaType = (url) => {
    const urlLower = url.toLowerCase();
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'];

    if (imageExtensions.some(ext => urlLower.includes(ext))) return 'image';
    if (videoExtensions.some(ext => urlLower.includes(ext))) return 'video';

    if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) return 'video';
    if (urlLower.includes('vimeo.com')) return 'video';
    if (urlLower.includes('imgur.com')) return 'image';

    return 'image';
  };

  const addUrlField = () => {
    setUrlUploads(prev => [...prev, '']);
  };

  const removeUrlField = (index) => {
    if (urlUploads.length === 1) {
      setUrlUploads(['']);
    } else {
      setUrlUploads(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleMediaPreview = (media) => {
    setSelectedMedia(media);
    setShowMediaModal(true);
  };

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url);
    alert('URL copiée dans le presse-papier!');
  };

  const validateAndPreviewUrl = (url, type) => {
    if (!url) return null;

    try {
      new URL(url); // Valide que c'est une URL valide

      if (type === 'image_url' || type === 'image' || url.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
        return (
          <div className="url-preview">
            <img src={url} alt="Preview" style={{ maxWidth: '100px', maxHeight: '100px' }} onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<span class="text-danger">Image non accessible</span>';
            }} />
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => setFormData(prev => ({ ...prev, [type]: '' }))}
            >
              <FiX />
            </button>
          </div>
        );
      }

      return (
        <div className="url-preview">
          <span className="text-success">✓ URL valide</span>
          <button
            type="button"
            className="btn btn-sm btn-outline"
            onClick={() => setFormData(prev => ({ ...prev, [type]: '' }))}
          >
            <FiX />
          </button>
        </div>
      );
    } catch (error) {
      return <span className="text-danger">URL invalide</span>;
    }
  };

  const togglePublication = async (item) => {
    try {
      const newStatus = !item.publie;
      await axios.put(`/api/articles/${item.id}`, { ...item, publie: newStatus });
      alert(`Article ${newStatus ? 'publié' : 'dépublié'} avec succès`);
      fetchData();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du changement de statut');
    }
  };

  const toggleApprobation = async (item) => {
    try {
      const newStatus = !item.approuve;
      await axios.put(`/api/temoignages/${item.id}`, { ...item, approuve: newStatus });
      alert(`Témoignage ${newStatus ? 'approuvé' : 'désapprouvé'} avec succès`);
      fetchData();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du changement de statut');
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedData = () => {
    const items = data[activeTab] || [];
    return [...items].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'created_at' || sortField.includes('date')) {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      if (sortDirection === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });
  };

  const getFilteredData = () => {
    const items = getSortedData();
    return items.filter(item => {
      if (filterStatut !== 'tous' && item.statut !== filterStatut) return false;
      if (filterCategorie !== 'tous' && item.categorie !== filterCategorie) return false;
      if (!searchTerm) return true;

      const term = searchTerm.toLowerCase();
      return Object.values(item).some(val =>
        val && val.toString().toLowerCase().includes(term)
      );
    });
  };

  const renderMediaUploadSection = () => {
    if (activeTab === 'articles') {
      return (
        <div className="form-section">
          <h4><FiUpload /> Images supplémentaires</h4>

          <div className="upload-mode-selector">
            <div className="mode-options">
              <button
                type="button"
                className={`mode-btn ${uploadMode === 'device' ? 'active' : ''}`}
                onClick={() => setUploadMode('device')}
              >
                <FiUpload /> Depuis l'appareil
              </button>
              <button
                type="button"
                className={`mode-btn ${uploadMode === 'url' ? 'active' : ''}`}
                onClick={() => setUploadMode('url')}
              >
                <FiLink /> Depuis une URL
              </button>
            </div>
          </div>

          {uploadMode === 'device' && (
            <>
              <div
                className="upload-dropzone"
                onClick={triggerFileInput}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add('drag-over');
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('drag-over');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('drag-over');
                  if (e.dataTransfer.files.length) {
                    const files = e.dataTransfer.files;
                    const dataTransfer = new DataTransfer();
                    for (let file of files) {
                      dataTransfer.items.add(file);
                    }
                    fileInputRef.current.files = dataTransfer.files;
                    handleFileUpload({ target: { files: dataTransfer.files } });
                  }
                }}
              >
                <FiUpload size={48} />
                <p>Cliquez pour sélectionner ou glissez-déposez vos fichiers</p>
                <p className="upload-info">
                  Formats supportés: JPG, PNG, GIF, WebP, SVG
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </div>

              {uploading && (
                <div className="progress-container">
                  <div className="progress-bar" style={{ width: `${uploadProgress}%` }}>
                    <span>{uploadProgress}%</span>
                  </div>
                </div>
              )}
            </>
          )}

          {uploadMode === 'url' && (
            <div className="url-upload-section">
              <div className="form-group">
                <label>Titre (optionnel, sera appliqué à tous)</label>
                <input
                  type="text"
                  className="form-control"
                  value={urlUploadData.titre}
                  onChange={(e) => setUrlUploadData(prev => ({ ...prev, titre: e.target.value }))}
                  placeholder="Ex: Photo article"
                />
              </div>

              <div className="form-group">
                <label>Description (optionnel)</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={urlUploadData.description}
                  onChange={(e) => setUrlUploadData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description des images"
                />
              </div>

              <div className="url-inputs-container">
                <label>URL(s) des images *</label>
                {urlUploads.map((url, index) => (
                  <div key={index} className="url-input-group">
                    <input
                      type="text"
                      className="form-control"
                      value={url}
                      onChange={(e) => {
                        const newUrls = [...urlUploads];
                        newUrls[index] = e.target.value;
                        setUrlUploads(newUrls);
                      }}
                      placeholder="https://exemple.com/image.jpg"
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => removeUrlField(index)}
                      disabled={urlUploads.length === 1}
                    >
                      <FiX />
                    </button>
                    {index === urlUploads.length - 1 && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        onClick={addUrlField}
                      >
                        <FiPlus />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleUrlUpload(urlUploads)}
                disabled={uploading || !urlUploads.some(url => url.trim() !== '')}
              >
                {uploading ? 'Upload en cours...' : 'Uploader les URLs'}
              </button>
            </div>
          )}

          {uploadedFiles.length > 0 && (
            <div className="uploaded-files">
              <h5>Fichiers uploadés:</h5>
              <div className="files-grid">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="file-item">
                    {file.type.includes('image') ? (
                      <img
                        src={file.url}
                        alt={file.originalName}
                        onClick={() => handleMediaPreview(file)}
                      />
                    ) : (
                      <div className="file-preview">
                        <FiFileText size={24} />
                        <span>{file.type}</span>
                      </div>
                    )}
                    <div className="file-info">
                      <span className="file-name">{file.originalName}</span>
                      <span className="file-size">{file.size}</span>
                    </div>
                    <div className="file-actions">
                      <button
                        className="btn btn-sm"
                        onClick={() => {
                          // Ajouter cette URL aux images supplémentaires
                          const currentImages = formData.images ? formData.images.split(',').filter(Boolean) : [];
                          if (!currentImages.includes(file.url)) {
                            const newImages = [...currentImages, file.url].join(',');
                            setFormData(prev => ({ ...prev, images: newImages }));
                            alert('Image ajoutée aux images supplémentaires');
                          }
                        }}
                      >
                        <FiPlus /> Ajouter
                      </button>
                      <button
                        className="btn btn-sm"
                        onClick={() => handleCopyUrl(file.url)}
                      >
                        <FiCopy />
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleRemoveFile(index)}
                      >
                        <FiXCircle />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Images supplémentaires (URLs séparées par des virgules):</label>
            <textarea
              name="images"
              className="form-control"
              rows="3"
              value={formData.images}
              onChange={handleInputChange}
              placeholder="https://exemple.com/image1.jpg, https://exemple.com/image2.jpg"
            />
            <small className="form-text text-muted">
              {formData.images ? formData.images.split(',').filter(Boolean).length : 0} image(s) supplémentaire(s)
            </small>
          </div>
        </div>
      );
    }

    // Pour les autres onglets (actions, événements, etc.)
    return (
      <div className="form-section">
        <h4><FiUpload /> Upload de Médias</h4>

        <div className="upload-mode-selector">
          <div className="mode-options">
            <button
              type="button"
              className={`mode-btn ${uploadMode === 'device' ? 'active' : ''}`}
              onClick={() => setUploadMode('device')}
            >
              <FiUpload /> Depuis l'appareil
            </button>
            <button
              type="button"
              className={`mode-btn ${uploadMode === 'url' ? 'active' : ''}`}
              onClick={() => setUploadMode('url')}
            >
              <FiLink /> Depuis une URL
            </button>
          </div>
        </div>

        {uploadMode === 'device' && (
          <>
            <div
              className="upload-dropzone"
              onClick={triggerFileInput}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add('drag-over');
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('drag-over');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('drag-over');
                if (e.dataTransfer.files.length) {
                  const files = e.dataTransfer.files;
                  const dataTransfer = new DataTransfer();
                  for (let file of files) {
                    dataTransfer.items.add(file);
                  }
                  fileInputRef.current.files = dataTransfer.files;
                  handleFileUpload({ target: { files: dataTransfer.files } });
                }
              }}
            >
              <FiUpload size={48} />
              <p>Cliquez pour sélectionner ou glissez-déposez vos fichiers</p>
              <p className="upload-info">
                Formats supportés: JPG, PNG, GIF, WebP, SVG, MP4, MPEG, OGG, WebM, MOV
              </p>
              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/*,video/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>

            {uploading && (
              <div className="progress-container">
                <div className="progress-bar" style={{ width: `${uploadProgress}%` }}>
                  <span>{uploadProgress}%</span>
                </div>
              </div>
            )}
          </>
        )}

        {uploadMode === 'url' && (
          <div className="url-upload-section">
            <div className="form-group">
              <label>Titre (optionnel, sera appliqué à tous)</label>
              <input
                type="text"
                className="form-control"
                value={urlUploadData.titre}
                onChange={(e) => setUrlUploadData(prev => ({ ...prev, titre: e.target.value }))}
                placeholder="Ex: Photo projet humanitaire"
              />
            </div>

            <div className="form-group">
              <label>Description (optionnel)</label>
              <textarea
                className="form-control"
                rows="2"
                value={urlUploadData.description}
                onChange={(e) => setUrlUploadData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description des médias"
              />
            </div>

            <div className="url-inputs-container">
              <label>URL(s) des médias *</label>
              {urlUploads.map((url, index) => (
                <div key={index} className="url-input-group">
                  <input
                    type="text"
                    className="form-control"
                    value={url}
                    onChange={(e) => {
                      const newUrls = [...urlUploads];
                      newUrls[index] = e.target.value;
                      setUrlUploads(newUrls);
                    }}
                    placeholder="https://exemple.com/image.jpg"
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => removeUrlField(index)}
                    disabled={urlUploads.length === 1}
                  >
                    <FiX />
                  </button>
                  {index === urlUploads.length - 1 && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      onClick={addUrlField}
                    >
                      <FiPlus />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleUrlUpload(urlUploads)}
              disabled={uploading || !urlUploads.some(url => url.trim() !== '')}
            >
              {uploading ? 'Upload en cours...' : 'Uploader les URLs'}
            </button>
          </div>
        )}

        {uploadedFiles.length > 0 && (
          <div className="uploaded-files">
            <h5>Fichiers uploadés:</h5>
            <div className="files-grid">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="file-item">
                  {file.type.includes('image') ? (
                    <img
                      src={file.url}
                      alt={file.originalName}
                      onClick={() => handleMediaPreview(file)}
                    />
                  ) : file.type.includes('video') ? (
                    <div className="video-preview" onClick={() => handleMediaPreview(file)}>
                      <FiVideo size={24} />
                      <span>Vidéo</span>
                    </div>
                  ) : (
                    <div className="file-preview">
                      <FiFileText size={24} />
                      <span>Document</span>
                    </div>
                  )}
                  <div className="file-info">
                    <span className="file-name">{file.originalName}</span>
                    <span className="file-size">{file.size}</span>
                  </div>
                  <div className="file-actions">
                    <button
                      className="btn btn-sm"
                      onClick={() => handleCopyUrl(file.url)}
                    >
                      <FiCopy />
                    </button>
                    <button
                      className="btn btn-sm"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: file.originalName,
                            text: 'Regardez ce média',
                            url: file.url
                          });
                        } else {
                          handleCopyUrl(file.url);
                        }
                      }}
                    >
                      <FiShare2 />
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleRemoveFile(index)}
                    >
                      <FiXCircle />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'actions' && (
          <>
            <div className="form-group">
              <label>URLs des photos (séparées par des virgules):</label>
              <textarea
                name="photos"
                className="form-control"
                rows="2"
                value={formData.photos}
                onChange={handleInputChange}
                placeholder="http://exemple.com/photo1.jpg, http://exemple.com/photo2.jpg"
              />
              {formData.photos && (
                <div className="photos-preview">
                  {formData.photos.split(',').filter(Boolean).slice(0, 3).map((url, index) => (
                    <div key={index} className="photo-preview-item">
                      <img src={url.trim()} alt={`Photo ${index + 1}`} />
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => {
                          const photos = formData.photos.split(',').filter(Boolean);
                          photos.splice(index, 1);
                          setFormData(prev => ({ ...prev, photos: photos.join(',') }));
                        }}
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}
                  {formData.photos.split(',').filter(Boolean).length > 3 && (
                    <span className="more-photos">+{formData.photos.split(',').filter(Boolean).length - 3} autres</span>
                  )}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>URLs des vidéos (séparées par des virgules):</label>
              <textarea
                name="videos"
                className="form-control"
                rows="2"
                value={formData.videos}
                onChange={handleInputChange}
                placeholder="http://exemple.com/video1.mp4, http://exemple.com/video2.mp4"
              />
            </div>
          </>
        )}

        {activeTab === 'evenements' && (
          <div className="form-group">
            <label>URLs des images (séparées par des virgules):</label>
            <textarea
              name="images_event"
              className="form-control"
              rows="2"
              value={formData.images_event}
              onChange={handleInputChange}
              placeholder="http://exemple.com/image1.jpg, http://exemple.com/image2.jpg"
            />
          </div>
        )}
      </div>
    );
  };

  const renderForm = () => {
    switch (activeTab) {
      case 'actions':
        return (
          <>
            <div className="form-section">
              <h4><FiFileText /> Informations générales</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Titre *</label>
                  <input type="text" name="titre" className="form-control" value={formData.titre} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select name="type" className="form-control" value={formData.type} onChange={handleInputChange}>
                    {typeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea name="description" className="form-control" rows="4" value={formData.description} onChange={handleInputChange} required />
              </div>
            </div>

            <div className="form-section">
              <h4><FiCalendar /> Dates et budget</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Date début</label>
                  <input type="date" name="date_debut" className="form-control" value={formData.date_debut} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Date fin</label>
                  <input type="date" name="date_fin" className="form-control" value={formData.date_fin} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Budget (€)</label>
                  <input type="number" name="budget" className="form-control" value={formData.budget} onChange={handleInputChange} step="0.01" />
                </div>
              </div>
            </div>

            {renderMediaUploadSection()}

            <div className="form-section">
              <h4><FiGlobe /> Localisation</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Pays</label>
                  <input type="text" name="pays" className="form-control" value={formData.pays} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Localisation</label>
                  <input type="text" name="localisation" className="form-control" value={formData.localisation} onChange={handleInputChange} />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4><FaHandshake /> Partenaires</h4>
              <div className="form-group">
                <label>Partenaires (séparés par des virgules)</label>
                <input type="text" name="partenaires" className="form-control" value={formData.partenaires} onChange={handleInputChange} />
              </div>
            </div>

            <div className="form-section">
              <h4><FiSettings /> Paramètres</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Statut</label>
                  <select name="statut" className="form-control" value={formData.statut} onChange={handleInputChange}>
                    {statutOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Ordre d'affichage</label>
                  <input type="number" name="ordre" className="form-control" value={formData.ordre} onChange={handleInputChange} />
                </div>
              </div>
              <div className="form-check">
                <input type="checkbox" name="is_featured" className="form-check-input" checked={formData.is_featured} onChange={handleInputChange} id="is_featured" />
                <label className="form-check-label" htmlFor="is_featured">
                  Mettre en avant sur le site
                </label>
              </div>
            </div>
          </>
        );

      case 'articles':
        return (
          <>
            <div className="form-section">
              <h4><FiFileText /> Contenu de l'article</h4>
              <div className="form-group">
                <label>Titre *</label>
                <input type="text" name="titre" className="form-control" value={formData.titre} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Résumé</label>
                <textarea name="resume" className="form-control" rows="2" value={formData.resume} onChange={handleInputChange} />
                <small className="form-text text-muted">Court résumé qui apparaîtra dans les listes</small>
              </div>
              <div className="form-group">
                <label>Contenu *</label>
                <textarea name="contenu" className="form-control" rows="8" value={formData.contenu} onChange={handleInputChange} required />
              </div>
            </div>

            <div className="form-section">
              <h4><FiImage /> Image principale</h4>
              <div className="form-group">
                <label>URL de l'image principale *</label>
                <input
                  type="text"
                  name="image_url"
                  className="form-control"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  placeholder="https://exemple.com/image-principale.jpg"
                  required
                />
                {validateAndPreviewUrl(formData.image_url, 'image_url')}
              </div>
            </div>

            {renderMediaUploadSection()}

            <div className="form-section">
              <h4><FiTag /> Métadonnées</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Auteur</label>
                  <input type="text" name="auteur" className="form-control" value={formData.auteur} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Catégorie</label>
                  <input type="text" name="categorie_article" className="form-control" value={formData.categorie_article} onChange={handleInputChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Mots-clés (séparés par des virgules)</label>
                <input type="text" name="mots_cles" className="form-control" value={formData.mots_cles} onChange={handleInputChange} />
              </div>
            </div>

            <div className="form-section">
              <h4><FiSettings /> Publication</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Statistiques</label>
                  <div className="stats-inputs">
                    <input type="number" name="vues" className="form-control" value={formData.vues} onChange={handleInputChange} placeholder="Vues" />
                    <input type="number" name="likes" className="form-control" value={formData.likes} onChange={handleInputChange} placeholder="Likes" />
                  </div>
                </div>
              </div>
              <div className="form-check">
                <input type="checkbox" name="publie" className="form-check-input" checked={formData.publie} onChange={handleInputChange} id="publie" />
                <label className="form-check-label" htmlFor="publie">
                  Publier immédiatement
                </label>
              </div>
              <div className="form-check">
                <input type="checkbox" name="is_featured" className="form-check-input" checked={formData.is_featured} onChange={handleInputChange} id="is_featured_article" />
                <label className="form-check-label" htmlFor="is_featured_article">
                  Mettre en avant sur la page d'accueil
                </label>
              </div>
            </div>
          </>
        );

      case 'categories':
        return (
          <>
            <div className="form-section">
              <h4><FiTag /> Catégorie</h4>
              <div className="form-group">
                <label>Nom de la catégorie *</label>
                <input type="text" name="nom_categorie" className="form-control" value={formData.nom_categorie} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description_categorie" className="form-control" rows="3" value={formData.description_categorie} onChange={handleInputChange} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Icône (FontAwesome)</label>
                  <input type="text" name="icone" className="form-control" value={formData.icone} onChange={handleInputChange} placeholder="fas fa-folder" />
                  <small className="form-text text-muted">Ex: fas fa-heart, fas fa-users, fas fa-graduation-cap</small>
                </div>
                <div className="form-group">
                  <label>Couleur</label>
                  <div className="color-input-wrapper">
                    <input type="color" name="couleur" className="form-control" value={formData.couleur} onChange={handleInputChange} style={{ height: '38px' }} />
                    <input type="text" name="couleur" className="form-control" value={formData.couleur} onChange={handleInputChange} style={{ flex: 1 }} />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>Ordre d'affichage</label>
                <input type="number" name="ordre_categorie" className="form-control" value={formData.ordre_categorie} onChange={handleInputChange} />
              </div>
            </div>
          </>
        );

      case 'faq':
        return (
          <>
            <div className="form-section">
              <h4><FiMessageSquare /> Question/Réponse</h4>
              <div className="form-group">
                <label>Question *</label>
                <textarea name="question" className="form-control" rows="2" value={formData.question} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Réponse *</label>
                <textarea name="reponse" className="form-control" rows="4" value={formData.reponse} onChange={handleInputChange} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Catégorie</label>
                  <select name="categorie_faq" className="form-control" value={formData.categorie_faq} onChange={handleInputChange}>
                    {categorieFAQOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Ordre d'affichage</label>
                  <input type="number" name="ordre_faq" className="form-control" value={formData.ordre_faq} onChange={handleInputChange} />
                </div>
              </div>
              <div className="form-check">
                <input type="checkbox" name="actif" className="form-check-input" checked={formData.actif} onChange={handleInputChange} id="actif" />
                <label className="form-check-label" htmlFor="actif">
                  Activer cette FAQ
                </label>
              </div>
            </div>
          </>
        );

      case 'temoignages':
        return (
          <>
            <div className="form-section">
              <h4><FiUser /> Informations personnelles</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Nom *</label>
                  <input type="text" name="nom_temoignage" className="form-control" value={formData.nom_temoignage} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Fonction</label>
                  <input type="text" name="fonction" className="form-control" value={formData.fonction} onChange={handleInputChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Region</label>
                  <input type="text" name="pays_temoignage" className="form-control" value={formData.pays_temoignage} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Note (1-5)</label>
                  <input type="number" name="note" className="form-control" value={formData.note} onChange={handleInputChange} min="1" max="5" />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4><FiMessageSquare /> Contenu du témoignage</h4>
              <div className="form-group">
                <label>Témoignage *</label>
                <textarea name="contenu_temoignage" className="form-control" rows="4" value={formData.contenu_temoignage} onChange={handleInputChange} required />
              </div>
            </div>

           <div className="form-section">
  <h4><FiImage /> Photo et association</h4>
  
  {/* Zone d'upload d'image */}
  <div className="form-group">
    <label>Télécharger une photo</label>
    <div className="upload-container">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        id="image-upload"
      />
      
      <div className="upload-area">
        {previewUrl ? (
          <div className="image-preview">
            <img src={previewUrl} alt="Aperçu" />
            <button 
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setPreviewUrl('');
              }}
              className="remove-image-btn"
            >
              ×
            </button>
          </div>
        ) : (
          <label htmlFor="image-upload" className="upload-label">
            <FiUpload size={24} />
            <span>Cliquez pour choisir une image</span>
            <small>JPG, PNG, GIF max 5MB</small>
          </label>
        )}
      </div>

      {/* Barre de progression */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${uploadProgress}%` }}
          >
            {uploadProgress}%
          </div>
        </div>
      )}

      {/* Bouton d'upload */}
      {selectedFile && !isUploading && (
        <button 
          type="button"
          onClick={uploadImage}
          className="upload-btn"
          disabled={isUploading}
        >
          Uploader l'image
        </button>
      )}

      {isUploading && (
        <p className="upload-status">Upload en cours... {uploadProgress}%</p>
      )}
    </div>
  </div>

  {/* URL de l'image (cachée ou en lecture seule) */}
  <div className="form-group" style={{ display: 'none' }}>
    <label>URL Photo</label>
    <input 
      type="text" 
      name="photo_url" 
      className="form-control" 
      value={formData.photo_url} 
      onChange={handleInputChange} 
      readOnly
    />
  </div>

  <div className="form-group">
    <label>Projet associé</label>
    <select name="projet_id" className="form-control" value={formData.projet_id} onChange={handleInputChange}>
      <option value="">Aucun projet associé</option>
      {data.actions.map(action => (
        <option key={action.id} value={action.id}>{action.titre}</option>
      ))}
    </select>
  </div>
</div>

            <div className="form-section">
              <h4><FiSettings /> Modération</h4>
              <div className="form-check">
                <input type="checkbox" name="approuve" className="form-check-input" checked={formData.approuve} onChange={handleInputChange} id="approuve" />
                <label className="form-check-label" htmlFor="approuve">
                  Approuver ce témoignage (visible sur le site)
                </label>
              </div>
            </div>
          </>
        );

      case 'evenements':
        return (
          <>
            <div className="form-section">
              <h4><FiCalendar /> Informations de l'événement</h4>
              <div className="form-group">
                <label>Titre *</label>
                <input type="text" name="titre_event" className="form-control" value={formData.titre_event} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description_event" className="form-control" rows="3" value={formData.description_event} onChange={handleInputChange} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select name="type_event" className="form-control" value={formData.type_event} onChange={handleInputChange}>
                    <option value="action">Action terrain</option>
                    <option value="formation">Formation</option>
                    <option value="reunion">Réunion</option>
                    <option value="collecte">Collecte de fonds</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Lieu</label>
                  <input type="text" name="lieu" className="form-control" value={formData.lieu} onChange={handleInputChange} />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4><FiClock /> Dates</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Date début</label>
                  <input type="datetime-local" name="date_debut_event" className="form-control" value={formData.date_debut_event} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Date fin</label>
                  <input type="datetime-local" name="date_fin_event" className="form-control" value={formData.date_fin_event} onChange={handleInputChange} />
                </div>
              </div>
            </div>

            {renderMediaUploadSection()}

            <div className="form-section">
              <h4><FiSettings /> Association et statut</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Projet associé</label>
                  <select name="projet_id_event" className="form-control" value={formData.projet_id_event} onChange={handleInputChange}>
                    <option value="">Aucun projet associé</option>
                    {data.actions.map(action => (
                      <option key={action.id} value={action.id}>{action.titre}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Statut</label>
                  <select name="statut_event" className="form-control" value={formData.statut_event} onChange={handleInputChange}>
                    <option value="planifie">Planifié</option>
                    <option value="en_cours">En cours</option>
                    <option value="termine">Terminé</option>
                    <option value="annule">Annulé</option>
                  </select>
                </div>
              </div>
            </div>
          </>
        );

      default:
        return (
          <div className="form-section">
            <h4><FiSettings /> Configuration</h4>
            <p>Formulaire de configuration pour {activeTab}</p>
          </div>
        );
    }
  };

  const renderTable = () => {
    const filteredItems = getFilteredData();

    if (filteredItems.length === 0) {
      return (
        <div className="no-data">
          <FiFileText size={48} />
          <p>Aucun élément trouvé</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'actions':
        return (
          <div className="card">
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Titre</th>
                    <th>Type</th>
                    <th>Dates</th>
                    <th>Budget</th>
                    <th>Statut</th>
                    <th>Médias</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map(item => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.titre}</strong>
                        <div className="item-preview">{item.description?.substring(0, 80)}...</div>
                      </td>
                      <td>
                        <span className="badge" style={{ backgroundColor: getTypeColor(item.type) }}>
                          {typeOptions.find(t => t.value === item.type)?.label || item.type}
                        </span>
                      </td>
                      <td>
                        <div className="date-info">
                          <div>{item.date_debut ? new Date(item.date_debut).toLocaleDateString('fr-FR') : '-'}</div>
                          <div>{item.date_fin ? new Date(item.date_fin).toLocaleDateString('fr-FR') : '-'}</div>
                        </div>
                      </td>
                      <td>
                        {item.budget ? (
                          <div className="budget-info">
                            <FiDollarSign />
                            <strong>{parseFloat(item.budget).toLocaleString('fr-FR')} €</strong>
                          </div>
                        ) : '-'}
                      </td>
                      <td>
                        <span className="badge" style={{ backgroundColor: getStatutColor(item.statut) }}>
                          {statutOptions.find(s => s.value === item.statut)?.label || item.statut}
                        </span>
                      </td>
                      <td>
                        {(item.photos || item.videos) && (
                          <div className="media-indicator">
                            {item.photos && (
                              <span className="media-count">
                                <FiImage /> {item.photos.split(',').length}
                              </span>
                            )}
                            {item.videos && (
                              <span className="media-count">
                                <FiVideo /> {item.videos.split(',').length}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn btn-sm" onClick={() => handleEditClick(item)}>
                            <FiEdit />
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDeleteClick(item)}>
                            <FiTrash2 />
                          </button>
                          {item.is_featured && <FiStar className="featured-icon" />}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'articles':
        return (
          <div >
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Titre</th>
                    <th>Auteur</th>
                    <th>Catégorie</th>
                    <th>Publication</th>
                    <th>Médias</th>
                    <th>Création</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map(item => (
                    <tr key={item.id}>
                      <td>
                        <div className="article-title">
                          <strong>{item.titre}</strong>
                          {item.image_url && <img src={item.image_url} alt="" className="article-thumb" />}
                          <div className="article-preview">{item.resume || item.contenu?.substring(0, 100)}...</div>
                        </div>
                      </td>
                      <td>
                        <div className="author-info">
                          <FiUser />
                          <span>{item.auteur || 'Anonyme'}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-category">
                          {item.categorie || 'Non catégorisé'}
                        </span>
                      </td>
                      <td>
                        <div className="publication-status">
                          <span className={`status-indicator ${item.publie ? 'published' : 'draft'}`}></span>
                          <span>{item.publie ? 'Publié' : 'Brouillon'}</span>
                          <button className="btn btn-sm" onClick={() => togglePublication(item)}>
                            {item.publie ? <FiEyeOff /> : <FiEye />}
                          </button>
                        </div>
                      </td>
                      <td>
                        <div className="media-counts">
                          {item.image_url && (
                            <span className="media-count" title="Image principale">
                              <FiImage /> 1
                            </span>
                          )}
                          {item.images && item.images.split(',').filter(Boolean).length > 0 && (
                            <span className="media-count" title={`${item.images.split(',').filter(Boolean).length} images supplémentaires`}>
                              <FiImage /> +{item.images.split(',').filter(Boolean).length}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>{new Date(item.created_at).toLocaleDateString('fr-FR')}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn btn-sm" onClick={() => handleEditClick(item)}>
                            <FiEdit />
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDeleteClick(item)}>
                            <FiTrash2 />
                          </button>
                          {item.is_featured && <FiStar className="featured-icon" />}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return (
          <div>
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Nom/Titre</th>
                    <th>Description</th>
                    <th>Création</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map(item => (
                    <tr key={item.id}>
                      <td><strong>{item.titre || item.nom || item.question || item.cle}</strong></td>
                      <td>{item.description?.substring(0, 100)}...</td>
                      <td>{new Date(item.created_at).toLocaleDateString('fr-FR')}</td>
                      <td>
                        <button className="btn btn-sm" onClick={() => handleEditClick(item)}>
                          <FiEdit />
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDeleteClick(item)}>
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
    }
  };

  const getTypeColor = (type) => {
    const option = typeOptions.find(t => t.value === type);
    return option ? option.color : '#95a5a6';
  };

  const getStatutColor = (statut) => {
    const option = statutOptions.find(s => s.value === statut);
    return option ? option.color : '#95a5a6';
  };

  const stats = {
    total: getFilteredData().length
  };

  return (
    <div className="gestion-contenu">
      <div className="gestion-header">
        <div className="header-left">
          <h1><FiSettings /> Gestion de Contenu</h1>
          <p className="subtitle">Administration complète du contenu du site</p>
        </div>
        <div className="header-right">
          <button className="btn btn-success" onClick={() => {
            setCurrentItem(null);
            resetForm();
            setShowModal(true);
          }}>
            <FiPlus /> Ajouter {activeTab}
          </button>
          <button className="btn btn-primary" onClick={fetchData}>
            <FiRefreshCw /> Actualiser
          </button>
        </div>
      </div>

      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#e8f4fd' }}>
            <FiFileText color="#3498db" />
          </div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</p>
          </div>
        </div>
      </div>

      <div className="tabs-navigation">
        <div className="tabs-container">
          {['actions', 'articles', 'categories', 'temoignages', 'faq','evenements'].map(tab => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              <span className="tab-icon">
                {tab === 'actions' && <FiFileText />}
                {tab === 'articles' && <FiFileText />}
                {tab === 'categories' && <FiTag />}
                {tab === 'temoignages' && <FiUser />}
                {tab === 'faq' && <FiMessageSquare />}
                {tab === 'evenements' && <FiCalendar />}
               
              </span>
              <span className="tab-label">{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
              <span className="tab-count">{data[tab]?.length || 0}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="filters-container">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder={`Rechercher ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>
              <FiX />
            </button>
          )}
        </div>
        <div className="filter-controls">
          {['actions', 'evenements'].includes(activeTab) && (
            <select className="filter-select" value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)}>
              <option value="tous">Tous les statuts</option>
              {statutOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )}
          <button className="btn btn-outline" onClick={() => {
            setSearchTerm('');
            setFilterStatut('tous');
            setFilterCategorie('tous');
          }}>
            <FiFilter /> Réinitialiser
          </button>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>
                {currentItem ? 'Modifier' : 'Ajouter'} {activeTab}
              </h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="modal-body">
                {renderForm()}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  {currentItem ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      <div className="card">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Chargement des données...</p>
          </div>
        ) : (
          <div className="content-card">
            <div className="content-header">
              <h3>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
              <div className="content-info">
                <span className="item-count">{getFilteredData().length} élément(s)</span>
              </div>
            </div>
            <div className="content-body">
              {renderTable()}
            </div>
          </div>
        )}
      </div>





      {showDeleteModal && currentItem && (
        <div className="modal-overlay">
          <div className="modal-container delete-modal">
            <div className="modal-header">
              <h2><FiTrash2 /> Confirmer la suppression</h2>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <div className="delete-warning">
                <FiTrash2 size={64} />
                <h3>Êtes-vous sûr ?</h3>
                <p>Vous êtes sur le point de supprimer :</p>
                <div className="delete-item-info">
                  <strong>{currentItem.titre || currentItem.nom || currentItem.question || currentItem.cle}</strong>
                </div>
                <p className="warning-text">Cette action est irréversible !</p>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setShowDeleteModal(false)}>
                Annuler
              </button>
              <button type="button" className="btn btn-danger" onClick={handleDelete}>
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}

      {showMediaModal && selectedMedia && (
        <div className="modal-overlay">
          <div className="modal-container media-modal">
            <div className="modal-header">
              <h2><FiImage /> Détails du média</h2>
              <button className="modal-close" onClick={() => setShowMediaModal(false)}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              {selectedMedia.type.includes('image') ? (
                <img src={selectedMedia.url} alt={selectedMedia.titre} className="media-preview-large" />
              ) : selectedMedia.type.includes('video') ? (
                <div className="video-preview-large">
                  <video src={selectedMedia.url} controls className="media-preview-large" />
                </div>
              ) : (
                <div className="document-preview">
                  <FiFileText size={64} />
                  <p>Document: {selectedMedia.titre}</p>
                </div>
              )}
              <div className="media-info">
                <h4>{selectedMedia.titre || 'Sans titre'}</h4>
                <p>{selectedMedia.description}</p>
                <div className="media-meta">
                  <div className="meta-item">
                    <span className="meta-label">Type</span>
                    <span className="meta-value">{selectedMedia.type}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Taille</span>
                    <span className="meta-value">{selectedMedia.size}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">URL</span>
                    <span className="meta-value url-truncate">{selectedMedia.url}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: selectedMedia.titre || 'Media',
                      text: selectedMedia.description || 'Partage de média',
                      url: selectedMedia.url
                    }).catch(console.error);
                  } else {
                    handleCopyUrl(selectedMedia.url);
                    alert('URL copiée! Vous pouvez maintenant la partager.');
                  }
                }}
              >
                <FiShare2 /> Partager
              </button>

              <button className="btn btn-outline" onClick={() => handleCopyUrl(selectedMedia.url)}>
                <FiCopy /> Copier l'URL
              </button>

              <a href={selectedMedia.url} download className="btn btn-outline">
                <FiDownload /> Télécharger
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

{/* Ajoutez ces styles CSS */}
<style jsx>{`
  .upload-container {
    margin-top: 10px;
  }

  .upload-area {
    border: 2px dashed #ddd;
    border-radius: 8px;
    padding: 20px;
    text-align: center;
    background: #f9f9f9;
    transition: all 0.3s ease;
  }

  .upload-area:hover {
    border-color: var(--primary-color);
    background: #f0f7ff;
  }

  .upload-label {
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    color: #666;
  }

  .upload-label svg {
    color: var(--primary-color);
  }

  .upload-label small {
    font-size: 0.8rem;
    color: #999;
  }

  .image-preview {
    position: relative;
    display: inline-block;
  }

  .image-preview img {
    max-width: 200px;
    max-height: 200px;
    border-radius: 4px;
    object-fit: cover;
  }

  .remove-image-btn {
    position: absolute;
    top: -10px;
    right: -10px;
    width: 25px;
    height: 25px;
    border-radius: 50%;
    background: #ff4444;
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }

  .remove-image-btn:hover {
    background: #cc0000;
  }

  .progress-bar {
    width: 100%;
    height: 20px;
    background: #f0f0f0;
    border-radius: 10px;
    margin-top: 10px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
    color: white;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: width 0.3s ease;
  }

  .upload-btn {
    margin-top: 10px;
    padding: 10px 20px;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .upload-btn:hover:not(:disabled) {
    background: var(--secondary-color);
    transform: translateY(-2px);
  }

  .upload-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .upload-status {
    margin-top: 10px;
    color: var(--primary-color);
    font-size: 0.9rem;
  }
`}</style>

export default GestionContenu;