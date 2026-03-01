import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Modal,
  FlatList,
  Dimensions,
  KeyboardAvoidingView,
  Button,
  Image,
} from 'react-native';
import * as DocumentPicker from 'react-native-document-picker';
import Icon from 'react-native-vector-icons/Ionicons';

const regions = [
  'Adamaoua', 'Centre', 'Est', 'Extrême-Nord', 'Littoral',
  'Nord', 'Nord-Ouest', 'Ouest', 'Sud', 'Sud-Ouest'
];

const structures = [
  'CMPJ', 'DAJEC', 'DRJEC', 'PNV', 'PRONEC-REAMORCE', 'Autres'
];

const typesActivite = [
  { id: 'formation', label: 'Formation' },
  { id: 'sensibilisation', label: 'Sensibilisation' },
  { id: 'autres', label: 'Autre' }
];

const StatisticsForm = () => {
  const [formData, setFormData] = useState({
    // Section I: Identification du Collecteur
    region: '',
    structure: '',
    autreStructure: '',
    nomPrenoms: '',
    fonction: '',
    documentValide: '',
    libelleActivite: '',
    typeActivite: '',
    autreType: '',
    objectifActivite: '',
    dateActivite: '',
    lieuActivite: '',

    // Section II: Données Statistiques
    // Sensibilisation
    sens_cible_h: '0',
    sens_cible_f: '0',
    sens_sens_h: '0',
    sens_sens_f: '0',
    sens_atteint_h: '0',
    sens_atteint_f: '0',

    // Formation
    form_cible_h: '0',
    form_cible_f: '0',
    form_forme_h: '0',
    form_forme_f: '0',
    form_atteint_h: '0',
    form_atteint_f: '0',

    // Autre activité
    autre_cible_h: '0',
    autre_cible_f: '0',
    autre_attendu_h: '0',
    autre_attendu_f: '0',
    autre_atteint_h: '0',
    autre_atteint_f: '0',

    // Suite Section II
    suiviPost: '',
    difficultes: '',
    recommandations: '',
    fichierRapport: null,
  });

  const [showRegionPicker, setShowRegionPicker] = useState(false);
  const [showStructurePicker, setShowStructurePicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [fileName, setFileName] = useState('');
  const [difficultesCount, setDifficultesCount] = useState(0);
  const [recommandationsCount, setRecommandationsCount] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Calculs automatiques
  const calculateTotals = (prefix) => {
    const cible_h = parseInt(formData[`${prefix}_cible_h`]) || 0;
    const cible_f = parseInt(formData[`${prefix}_cible_f`]) || 0;
    const cible_total = cible_h + cible_f;

    const second_h = parseInt(formData[`${prefix}_${prefix === 'autre' ? 'attendu' : prefix === 'form' ? 'forme' : 'sens'}_h`]) || 0;
    const second_f = parseInt(formData[`${prefix}_${prefix === 'autre' ? 'attendu' : prefix === 'form' ? 'forme' : 'sens'}_f`]) || 0;
    const second_total = second_h + second_f;

    const atteint_h = parseInt(formData[`${prefix}_atteint_h`]) || 0;
    const atteint_f = parseInt(formData[`${prefix}_atteint_f`]) || 0;
    const atteint_total = atteint_h + atteint_f;

    const pourcentage = cible_total > 0 ? Math.round((atteint_total / cible_total) * 100) : 0;

    return { cible_total, second_total, atteint_total, pourcentage };
  };

  const sensTotals = calculateTotals('sens');
  const formTotals = calculateTotals('form');
  const autreTotals = calculateTotals('autre');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Mettre à jour les compteurs de caractères
    if (field === 'difficultes') {
      setDifficultesCount(value.length);
      if (value.length > 30) {
        setFormData(prev => ({
          ...prev,
          difficultes: value.substring(0, 30)
        }));
      }
    }
    
    if (field === 'recommandations') {
      setRecommandationsCount(value.length);
      if (value.length > 30) {
        setFormData(prev => ({
          ...prev,
          recommandations: value.substring(0, 30)
        }));
      }
    }
  };

  const handleNumberInput = (field, value) => {
    // Permettre seulement les nombres
    const cleanedValue = value.replace(/[^0-9]/g, '');
    handleInputChange(field, cleanedValue === '' ? '0' : cleanedValue);
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.doc, DocumentPicker.types.docx],
      });

      if (result) {
        setFileName(result[0].name);
        handleInputChange('fichierRapport', result[0]);
      }
    } catch (error) {
      if (DocumentPicker.isCancel(error)) {
        console.log('Sélection de fichier annulée');
      } else {
        console.error('Erreur lors de la sélection du document:', error);
        Alert.alert('Erreur', 'Impossible de sélectionner le fichier');
      }
    }
  };

  const handleSubmit = () => {
    // Validation
    const errors = [];
    
    if (!formData.region) errors.push('Région');
    if (!formData.structure) errors.push('Structure');
    if (!formData.nomPrenoms) errors.push('Nom et Prénoms');
    if (!formData.fonction) errors.push('Fonction');
    if (!formData.documentValide) errors.push('Document validé');
    if (!formData.libelleActivite) errors.push('Libellé de l\'activité');
    if (!formData.typeActivite) errors.push('Type d\'activité');
    if (!formData.objectifActivite) errors.push('Objectif de l\'activité');
    if (!formData.lieuActivite) errors.push('Lieu de l\'activité');
    if (!formData.suiviPost) errors.push('Suivi post-activité');
    if (!formData.difficultes) errors.push('Difficultés rencontrées');
    if (!formData.recommandations) errors.push('Recommandations');
    if (!formData.fichierRapport) errors.push('Fichier rapport');

    if (formData.structure === 'Autres' && !formData.autreStructure) {
      errors.push('Précision de la structure');
    }

    if (formData.typeActivite === 'autres' && !formData.autreType) {
      errors.push('Précision du type d\'activité');
    }

    if (errors.length > 0) {
      Alert.alert(
        'Champs obligatoires manquants',
        `Veuillez remplir les champs suivants:\n${errors.join('\n')}`
      );
      return;
    }

    // Préparer les données pour l'envoi
    const submissionData = {
      ...formData,
      dateActivite: selectedDate.toISOString().split('T')[0], // Format YYYY-MM-DD
      sensTotals,
      formTotals,
      autreTotals
    };

    console.log('Données à soumettre:', submissionData);
    
    Alert.alert(
      'Formulaire soumis',
      'Votre formulaire a été soumis avec succès!',
      [{ text: 'OK' }]
    );
  };

  const resetForm = () => {
    setFormData({
      region: '',
      structure: '',
      autreStructure: '',
      nomPrenoms: '',
      fonction: '',
      documentValide: '',
      libelleActivite: '',
      typeActivite: '',
      autreType: '',
      objectifActivite: '',
      dateActivite: '',
      lieuActivite: '',
      sens_cible_h: '0',
      sens_cible_f: '0',
      sens_sens_h: '0',
      sens_sens_f: '0',
      sens_atteint_h: '0',
      sens_atteint_f: '0',
      form_cible_h: '0',
      form_cible_f: '0',
      form_forme_h: '0',
      form_forme_f: '0',
      form_atteint_h: '0',
      form_atteint_f: '0',
      autre_cible_h: '0',
      autre_cible_f: '0',
      autre_attendu_h: '0',
      autre_attendu_f: '0',
      autre_atteint_h: '0',
      autre_atteint_f: '0',
      suiviPost: '',
      difficultes: '',
      recommandations: '',
      fichierRapport: null,
    });
    setSelectedDate(new Date());
    setFileName('');
    setDifficultesCount(0);
    setRecommandationsCount(0);
  };

  const renderSectionHeader = (iconName, title) => (
    <View style={styles.sectionHeader}>
      <Icon name={iconName} size={24} color="#2c3e50" style={styles.sectionIcon} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const renderPickerModal = (visible, setVisible, title, data, selectedValue, onSelect) => (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Icon name="close" size={24} color="#2c3e50" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={data}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  onSelect(item);
                  setVisible(false);
                }}
              >
                <Text style={styles.modalItemText}>{item}</Text>
                {selectedValue === item && (
                  <Icon name="checkmark" size={20} color="#3498db" />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  const renderRadioGroup = (field, options) => (
    <View style={styles.radioGroup}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={styles.radioOption}
          onPress={() => handleInputChange(field, option.value)}
        >
          <View style={[
            styles.radioCircle,
            formData[field] === option.value && styles.radioCircleSelected
          ]}>
            {formData[field] === option.value && (
              <View style={styles.radioInnerCircle} />
            )}
          </View>
          <Text style={styles.radioLabel}>{option.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStatsTable = (title, prefix, totals) => {
    // Afficher seulement si c'est le type d'activité sélectionné
    const shouldShow = 
      (prefix === 'sens' && formData.typeActivite === 'sensibilisation') ||
      (prefix === 'form' && formData.typeActivite === 'formation') ||
      (prefix === 'autre' && formData.typeActivite === 'autres');

    if (!shouldShow) return null;

    const secondLabel = prefix === 'autre' ? 'attendu' : prefix === 'form' ? 'forme' : 'sens';

    return (
      <View style={styles.statsSection}>
        <Text style={styles.statsTitle}>{title}</Text>
        <View style={styles.table}>
          {/* En-tête du tableau */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Catégorie</Text>
            <Text style={styles.tableHeaderCell}>Hommes</Text>
            <Text style={styles.tableHeaderCell}>Femmes</Text>
            <Text style={styles.tableHeaderCell}>Total</Text>
          </View>

          {/* Ligne 1: Personnes ciblées */}
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 2 }]}>a. Personnes ciblées</Text>
            <TextInput
              style={[styles.tableInput, styles.numberInput]}
              value={formData[`${prefix}_cible_h`]}
              onChangeText={(value) => handleNumberInput(`${prefix}_cible_h`, value)}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.tableInput, styles.numberInput]}
              value={formData[`${prefix}_cible_f`]}
              onChangeText={(value) => handleNumberInput(`${prefix}_cible_f`, value)}
              keyboardType="numeric"
            />
            <Text style={[styles.tableCell, styles.totalCell]}>{totals.cible_total}</Text>
          </View>

          {/* Ligne 2 */}
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 2 }]}>
              b. Personnes {secondLabel === 'attendu' ? 'attendues' : secondLabel + 'ées'}
            </Text>
            <TextInput
              style={[styles.tableInput, styles.numberInput]}
              value={formData[`${prefix}_${secondLabel}_h`]}
              onChangeText={(value) => handleNumberInput(`${prefix}_${secondLabel}_h`, value)}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.tableInput, styles.numberInput]}
              value={formData[`${prefix}_${secondLabel}_f`]}
              onChangeText={(value) => handleNumberInput(`${prefix}_${secondLabel}_f`, value)}
              keyboardType="numeric"
            />
            <Text style={[styles.tableCell, styles.totalCell]}>{totals.second_total}</Text>
          </View>

          {/* Ligne 3: Jeunes atteints */}
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 2 }]}>c. Jeunes atteints</Text>
            <TextInput
              style={[styles.tableInput, styles.numberInput]}
              value={formData[`${prefix}_atteint_h`]}
              onChangeText={(value) => handleNumberInput(`${prefix}_atteint_h`, value)}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.tableInput, styles.numberInput]}
              value={formData[`${prefix}_atteint_f`]}
              onChangeText={(value) => handleNumberInput(`${prefix}_atteint_f`, value)}
              keyboardType="numeric"
            />
            <Text style={[styles.tableCell, styles.totalCell]}>{totals.atteint_total}</Text>
          </View>

          {/* Ligne 4: Pourcentage */}
          <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
            <Text style={[styles.tableCell, { flex: 3 }]}>
              d. Niveau d'atteinte (%)
            </Text>
            <Text style={[styles.tableCell, styles.percentageCell]}>{totals.pourcentage}%</Text>
          </View>
        </View>
      </View>
    );
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  const handleDateConfirm = (date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      handleInputChange('dateActivite', date.toISOString().split('T')[0]);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scrollView}>
        {/* En-tête */}
        <View style={styles.header}>
          <Icon name="stats-chart" size={40} color="white" />
          <Text style={styles.headerTitle}>Formulaire de Collecte de Données Statistiques</Text>
          <Text style={styles.headerSubtitle}>
            Veuillez remplir ce formulaire avec les informations relatives à l'activité réalisée.
            Tous les champs marqués d'un * sont obligatoires.
          </Text>
        </View>

        {/* Formulaire */}
        <View style={styles.formContainer}>
          {/* Section I: Identification du Collecteur */}
          {renderSectionHeader('person-circle', 'I. Identification du Collecteur')}
          
          {/* 1. Région */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              1. Région <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => setShowRegionPicker(true)}
            >
              <Text style={formData.region ? styles.selectText : styles.placeholderText}>
                {formData.region || 'Sélectionnez une région'}
              </Text>
              <Icon name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>

            {/* 2. Structure */}
            <Text style={[styles.label, styles.marginTop]}>
              2. Structure <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => setShowStructurePicker(true)}
            >
              <Text style={formData.structure ? styles.selectText : styles.placeholderText}>
                {formData.structure || 'Sélectionnez une structure'}
              </Text>
              <Icon name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>

            {formData.structure === 'Autres' && (
              <TextInput
                style={[styles.input, styles.marginTop]}
                placeholder="Précisez la structure"
                value={formData.autreStructure}
                onChangeText={(value) => handleInputChange('autreStructure', value)}
              />
            )}

            {/* 3. Nom et Prénoms */}
            <Text style={[styles.label, styles.marginTop]}>
              3. Nom et Prénoms <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={formData.nomPrenoms}
              onChangeText={(value) => handleInputChange('nomPrenoms', value)}
              placeholder="Entrez votre nom et prénoms"
            />

            {/* 4. Fonction */}
            <Text style={[styles.label, styles.marginTop]}>
              4. Fonction <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={formData.fonction}
              onChangeText={(value) => handleInputChange('fonction', value)}
              placeholder="Entrez votre fonction"
            />

            {/* 5. Document validé */}
            <Text style={[styles.label, styles.marginTop]}>
              5. Document validé par le Chef centre? <Text style={styles.required}>*</Text>
            </Text>
            {renderRadioGroup('documentValide', [
              { value: 'oui', label: 'OUI' },
              { value: 'non', label: 'NON' }
            ])}

            {/* 6. Libellé de l'activité */}
            <Text style={[styles.label, styles.marginTop]}>
              6. Libellé de l'activité réalisée <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={formData.libelleActivite}
              onChangeText={(value) => handleInputChange('libelleActivite', value)}
              placeholder="Entrez le libellé de l'activité"
            />

            {/* 7. Type de l'activité */}
            <Text style={[styles.label, styles.marginTop]}>
              7. Type de l'activité <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => setShowTypePicker(true)}
            >
              <Text style={formData.typeActivite ? styles.selectText : styles.placeholderText}>
                {formData.typeActivite ? 
                  typesActivite.find(t => t.id === formData.typeActivite)?.label : 
                  'Sélectionnez un type'}
              </Text>
              <Icon name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>

            {formData.typeActivite === 'autres' && (
              <TextInput
                style={[styles.input, styles.marginTop]}
                placeholder="Précisez le type d'activité"
                value={formData.autreType}
                onChangeText={(value) => handleInputChange('autreType', value)}
              />
            )}

            {/* 8. Objectif de l'activité */}
            <Text style={[styles.label, styles.marginTop]}>
              8. Objectif de l'activité <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.objectifActivite}
              onChangeText={(value) => handleInputChange('objectifActivite', value)}
              placeholder="Décrivez l'objectif de l'activité"
              multiline
              numberOfLines={3}
            />

            {/* 9. Date de l'activité */}
            <Text style={[styles.label, styles.marginTop]}>
              9. Date de l'activité <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={showDatePickerModal}
            >
              <Text style={styles.selectText}>
                {selectedDate.toLocaleDateString('fr-FR')}
              </Text>
              <Icon name="calendar" size={20} color="#666" />
            </TouchableOpacity>

            {/* 10. Lieu de l'activité */}
            <Text style={[styles.label, styles.marginTop]}>
              10. Lieu de l'activité <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={formData.lieuActivite}
              onChangeText={(value) => handleInputChange('lieuActivite', value)}
              placeholder="Entrez le lieu de l'activité"
            />
          </View>

          {/* Section II: Données Statistiques */}
          {renderSectionHeader('bar-chart', 'II. Données Statistiques')}
          
          {/* Tableaux statistiques */}
          <View style={styles.formGroup}>
            {renderStatsTable('1. Sensibilisation', 'sens', sensTotals)}
            {renderStatsTable('2. Formation', 'form', formTotals)}
            {renderStatsTable('3. Autre activité', 'autre', autreTotals)}

            {/* 4. Suivi post-activité */}
            <Text style={styles.label}>
              4. Faites-vous un suivi post-activité? <Text style={styles.required}>*</Text>
            </Text>
            {renderRadioGroup('suiviPost', [
              { value: 'oui', label: 'OUI' },
              { value: 'non', label: 'NON' }
            ])}

            {/* 5. Difficultés rencontrées */}
            <Text style={[styles.label, styles.marginTop]}>
              5. Difficultés rencontrées <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.difficultes}
              onChangeText={(value) => handleInputChange('difficultes', value)}
              placeholder="Maximum 30 caractères"
              multiline
              maxLength={30}
            />
            <Text style={styles.charCount}>{difficultesCount}/30 caractères</Text>

            {/* 6. Recommandations */}
            <Text style={[styles.label, styles.marginTop]}>
              6. Recommandations <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.recommandations}
              onChangeText={(value) => handleInputChange('recommandations', value)}
              placeholder="Maximum 30 caractères"
              multiline
              maxLength={30}
            />
            <Text style={styles.charCount}>{recommandationsCount}/30 caractères</Text>

            {/* 7. Téléverser le rapport */}
            <Text style={[styles.label, styles.marginTop]}>
              7. Téléverser votre rapport (PDF ou Word) <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity style={styles.fileUpload} onPress={pickDocument}>
              <Icon name="cloud-upload" size={40} color="#3498db" />
              <Text style={styles.fileUploadText}>
                Cliquez pour sélectionner votre fichier
              </Text>
              <Text style={styles.fileUploadSubtext}>
                Formats acceptés: PDF, DOC, DOCX
              </Text>
              {fileName ? (
                <Text style={styles.fileName}>{fileName}</Text>
              ) : (
                <Text style={styles.filePlaceholder}>Aucun fichier sélectionné</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Boutons d'action */}
          <View style={styles.buttonGroup}>
            <TouchableOpacity style={styles.resetButton} onPress={resetForm}>
              <Icon name="refresh" size={20} color="#2c3e50" />
              <Text style={styles.resetButtonText}>Réinitialiser</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Icon name="send" size={20} color="white" />
              <Text style={styles.submitButtonText}>Soumettre</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pied de page */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Formulaire de collecte de données statistiques © 2023
          </Text>
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.datePickerModal}>
            <View style={styles.datePickerContainer}>
              <View style={styles.datePickerHeader}>
                <Text style={styles.datePickerTitle}>Sélectionnez une date</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Icon name="close" size={24} color="#2c3e50" />
                </TouchableOpacity>
              </View>
              <View style={styles.datePickerContent}>
                <Button
                  title="Aujourd'hui"
                  onPress={() => handleDateConfirm(new Date())}
                />
                <View style={styles.dateSpacer} />
                <Button
                  title="Sélectionner manuellement"
                  onPress={() => {
                    // Ici vous pourriez implémenter un date picker custom
                    Alert.alert(
                      'Sélection de date',
                      'Pour une implémentation complète, utilisez @react-native-community/datetimepicker',
                      [{ text: 'OK', onPress: () => setShowDatePicker(false) }]
                    );
                  }}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Modaux de sélection */}
      {renderPickerModal(
        showRegionPicker,
        setShowRegionPicker,
        'Sélectionnez une région',
        regions,
        formData.region,
        (value) => handleInputChange('region', value)
      )}

      {renderPickerModal(
        showStructurePicker,
        setShowStructurePicker,
        'Sélectionnez une structure',
        structures,
        formData.structure,
        (value) => handleInputChange('structure', value)
      )}

      {renderPickerModal(
        showTypePicker,
        setShowTypePicker,
        'Sélectionnez un type d\'activité',
        typesActivite.map(t => t.label),
        formData.typeActivite ? typesActivite.find(t => t.id === formData.typeActivite)?.label : '',
        (value) => {
          const type = typesActivite.find(t => t.label === value);
          handleInputChange('typeActivite', type?.id || '');
        }
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#2c3e50',
    padding: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 18,
  },
  formContainer: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#1abc9c',
  },
  sectionIcon: {
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  required: {
    color: '#e74c3c',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  selectInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 6,
    padding: 12,
    backgroundColor: 'white',
  },
  selectText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  marginTop: {
    marginTop: 15,
  },
  radioGroup: {
    flexDirection: 'row',
    marginTop: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 25,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioCircleSelected: {
    borderColor: '#3498db',
  },
  radioInnerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3498db',
  },
  radioLabel: {
    fontSize: 16,
    color: '#333',
  },
  statsSection: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  statsTitle: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  table: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 6,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2c3e50',
    padding: 10,
  },
  tableHeaderCell: {
    flex: 1,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 12,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#bdc3c7',
    backgroundColor: 'white',
    minHeight: 45,
  },
  tableCell: {
    flex: 1,
    padding: 10,
    textAlign: 'center',
    justifyContent: 'center',
    fontSize: 12,
  },
  tableInput: {
    flex: 1,
    padding: 8,
    textAlign: 'center',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    margin: 2,
    borderRadius: 4,
  },
  numberInput: {
    backgroundColor: '#f8f9fa',
  },
  totalCell: {
    backgroundColor: '#e8f4fc',
    fontWeight: '600',
  },
  percentageCell: {
    backgroundColor: '#e8f6f3',
    color: '#27ae60',
    fontWeight: '600',
  },
  charCount: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'right',
    marginTop: 4,
    fontStyle: 'italic',
  },
  fileUpload: {
    borderWidth: 2,
    borderColor: '#bdc3c7',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  fileUploadText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 10,
    marginBottom: 5,
    textAlign: 'center',
  },
  fileUploadSubtext: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  fileName: {
    fontSize: 12,
    color: '#27ae60',
    fontWeight: '600',
  },
  filePlaceholder: {
    fontSize: 12,
    color: '#999',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: 15,
    borderRadius: 6,
    marginRight: 10,
  },
  resetButtonText: {
    color: '#2c3e50',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 6,
    marginLeft: 10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    padding: 15,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#bdc3c7',
    marginTop: 10,
  },
  footerText: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: Dimensions.get('window').height * 0.6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
  datePickerModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  datePickerContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  datePickerContent: {
    alignItems: 'center',
  },
  dateSpacer: {
    height: 15,
  },
});

export default StatisticsForm;