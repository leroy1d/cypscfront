import React from 'react';
import './PlanActionNational.css'; // Vous pouvez créer ce fichier CSS séparément

const PlanActionNational = () => {
  return (
    <div className="pan-container">
      {/* Page 1 - Couverture */}
      <div className="page couverture">
        <div className="republique">
          <h1>RÉPUBLIQUE DU CAMEROUN</h1>
          <p>Paix – Travail – Patrie</p>
          <p className="english">REPUBLIC OF CAMEROON</p>
          <p className="english">Peace – Work – Fatherland</p>
        </div>
        <div className="titre-principal">
          <p className="mois">Septembre 2025</p>
          <h2>PLAN D'ACTION NATIONAL</h2>
          <h2>JEUNESSE, PAIX ET</h2>
          <h2>SÉCURITÉ 2025-2030</h2>
        </div>
      </div>

      {/* Page 4 - Portraits */}
      <div className="page portraits">
        <div className="portrait-item">
          <div className="portrait-placeholder"></div>
          <p className="nom">S.E.M Paul Biya</p>
          <p className="titre">Président de la République du Cameroun</p>
        </div>
        <div className="portrait-item">
          <div className="portrait-placeholder"></div>
          <p className="nom">Dr Chief Dion Ngute</p>
          <p className="titre">Premier Ministre, Chef du Gouvernement</p>
        </div>
        <div className="portrait-item">
          <div className="portrait-placeholder"></div>
          <p className="nom">M. Mounouna Foutsou</p>
          <p className="titre">Ministre de la Jeunesse et de l'Education Civique</p>
        </div>
        <div className="portrait-item">
          <div className="portrait-placeholder"></div>
          <p className="nom">Mme. Fadimatou Iyawa Ousmanou</p>
          <p className="titre">Présidente Nationale du Conseil National de la Jeunesse du Cameroun</p>
        </div>
      </div>

      {/* Page 5 - Sommaire */}
      <div className="page sommaire">
        <h2>SOMMAIRE</h2>
        <ul>
          <li>INTRODUCTION - 10</li>
          <li>CONTEXTE - 12</li>
          <li>ALIGNEMENT AVEC LES POLITIQUES EXISTANTES ET LES CADRES JURIDIQUES - 18</li>
          <li>PROCESSUS DE DÉVELOPPEMENT DU PAN ET MÉTHODOLOGIE - 22</li>
          <li>LE PLAN D'ACTION NATIONAL - 29</li>
          <li>PRINCIPAUX AXES STRATEGIQUES - 31</li>
          <li>MÉCANISME DE SUIVI ET D'ÉVALUATION - 45</li>
          <li>CADRE BUDGETAIRE - 50</li>
          <li>CONCLUSION - 52</li>
          <li>ANNEXES - 53</li>
          <li>RÉFÉRENCES BIBLIOGRAPHIQUES - 59</li>
        </ul>
      </div>

      {/* Page 7 - Liste des abréviations */}
      <div className="page abreviations">
        <h2>LISTE DES ABRÉVIATIONS</h2>
        <table className="table-abrev">
          <tr><td>SND 30</td><td>Stratégie Nationale de Développement du Cameroun 2020-2030</td></tr>
          <tr><td>SNU</td><td>Système des Nations Unies</td></tr>
          <tr><td>UA</td><td>Union Africaine</td></tr>
          <tr><td>UE</td><td>Union Européenne</td></tr>
          <tr><td>UNESCO</td><td>Organisation des Nations Unies pour l'Éducation, la Science et la Culture</td></tr>
          <tr><td>UNFPA</td><td>Fonds des Nations Unies pour la Population</td></tr>
          <tr><td>UNICEF</td><td>Fonds des Nations Unies pour l'Enfance</td></tr>
          <tr><td>UNOY</td><td>United Network of Young Peacebuilders</td></tr>
          <tr><td>UNPBF</td><td>Fonds des Nations Unies pour la consolidation de la paix</td></tr>
          <tr><td>VBG</td><td>Violence Basées sur le Genre</td></tr>
        </table>
        
        <h3 className="mt-4">LISTE DES TABLEAUX ET DES FIGURES</h3>
        <p>Tableau 1. Engagement des intervenants à l'égard du PAN sur JPS</p>
        <p>Tableau 2. Le cadre de mise en œuvre et l'impact voulu</p>
        <p>Figure 1. Structure de coordination et de surveillance du JPS</p>
      </div>

      {/* Page 8 - Avant-propos */}
      <div className="page avant-propos">
        <h2>AVANT-PROPOS</h2>
        <p>Le Cameroun, terre de diversité, de résilience et de promesses, fait face à des enjeux multiples qui interpellent sa jeunesse, sa paix et sa sécurité. Dans un monde marqué par l'instabilité, les fractures sociales, les bouleversements climatiques, les flux migratoires et les mutations géopolitiques, il devient impératif de donner aux jeunes camerounais les outils, les espaces et les opportunités nécessaires pour devenir non plus de simples bénéficiaires, mais des partenaires clés et des bâtisseurs actifs de la paix durable.</p>
        <p>Ce Plan d'Action National Jeunesse, Paix et Sécurité (PAN-JPS) s'inscrit dans cette dynamique ambitieuse et profondément humaniste. Il est le fruit d'une consultation intergénérationnelle, inclusive et participative, inspirée par les actions transformatives des jeunes pour la paix, la ferme volonté du gouvernement camerounais à bâtir un Cameroun où la jeunesse est reconnue comme un atout, et le Cadre Continental de l'Union Africaine pour les jeunes, la Paix et la Sécurité ainsi que la Résolution 2250 (2015) du Conseil de Sécurité des Nations Unies.</p>
        <p>Cet engagement collectif, porté par les jeunes femmes et les jeunes hommes, des organisations de jeunes, des acteurs communautaires, des institutions publiques, et des partenaires techniques et financiers, incarne l'espoir d'un avenir pacifique, juste et équitable.</p>
        <p className="signature">Puisse ce document marquer un tournant décisif dans la construction d'une paix positive, inclusive et durable au cœur de notre nation et qu'il soit pour les générations présentes et futures une boussole, un levier d'engagement et un symbole d'une gouvernance fondée sur l'écoute, la confiance et la dignité.</p>
      </div>

      {/* Page 9 - Message du Ministre */}
      <div className="page message-ministre">
        <h2>MOUNOUNA FOUTSOU</h2>
        <h3>LE MINISTRE DE LA JEUNESSE ET DE L'ÉDUCATION CIVIQUE</h3>
        <p>Le Cameroun vient de franchir une étape cruciale de son histoire, en adoptant son tout premier Plan d'Action National « Jeunesse, Paix et Sécurité » (PAN-JPS). Ce plan traduit la volonté manifeste du gouvernement de la République à mettre les jeunes femmes et les jeunes hommes au centre des actions de préservation de la cohésion sociale, la prévention des conflits et la consolidation de la paix durable dans notre pays.</p>
        <p>Fruit d'un long processus inclusif, participatif et intergénérationnel mené entre 2017 et 2025 par le Ministère de la Jeunesse et de l'Education Civique, en collaboration avec la Commission Nationale Jeunesse Paix et Sécurité, le PAN-JPS est l'aboutissement d'une synergie des contributions des milliers de jeunes, d'organisations de la société civile, d'autorités traditionnelles et religieuses, d'institutions publiques et privées ainsi que des partenaires techniques et financiers.</p>
        <p>Le PAN-JPS s'inscrit dans le continuum de la recherche des moyens de préservation et maintien de la paix permanente ayant toujours inspiré la politique pionnière du Président de la République, S.E.M. Paul BIYA, la Vision 2035, la Stratégie Nationale de Développement 2020–2030 (SND30) et la Politique Nationale de la Jeunesse.</p>
        <p className="citation">"Ensemble, faisons de notre jeunesse le fer de lance d'une Nation forte et prospère."</p>
      </div>

      {/* Pages 10-11 - Introduction */}
      <div className="page introduction">
        <h2>INTRODUCTION</h2>
        <p>Au Cameroun, comme dans de nombreuses nations, la jeunesse est un enjeu à la fois de développement et de paix. Elle est fréquemment perçue comme la composante la plus sensible et vulnérable du tissu social. En ce sens, les politiques publiques tendent à cibler les préoccupations socio-économiques et politique des jeunes, en vue de résoudre les différents problèmes auxquels ils font face.</p>
        <p>La population camerounaise est essentiellement jeune. En effet, environ 65% de la population du pays est composée de jeunes femmes et hommes âgés de moins de 35 ans. En raison de leur poids démographique, les jeunes, occupent une place de choix dans le processus de développement durable du Cameroun.</p>
        <p>Le Cameroun est un pays riche en diversité culturelle et en ressources naturelles, mais il fait face à des défis significatifs liés à la montée des discours de haine et la xénophobie, l'extrémisme violent et aux conflits internes. Il s'agit notamment de la montée de l'extrémisme violent (Boko Haram depuis 2014, la crise dans les régions du Nord-Ouest et du Sud-Ouest depuis 2016), les déplacements massifs de population, notamment de jeunes, les violences sexuelles contre les femmes et les jeunes filles, les défis économiques et sociaux (chômage, pauvreté, précarité, etc.).</p>
        
        <h3>Les cinq signes vitaux de paix</h3>
        <ul>
          <li>Renforcement de l'action des jeunes pour la paix</li>
          <li>Renforcement de la confiance institutionnelle et de la légitimité de l'agenda JPS</li>
          <li>Réduction de la violence et de la criminalité</li>
          <li>Amélioration de la confiance mutuelle entre les jeunes</li>
          <li>Renforcement de la collaboration entre les jeunes, le gouvernement, les CTDs, les autorités traditionnelles et religieuses et les PTF</li>
        </ul>
      </div>

      {/* Pages 12-17 - Contexte et défis */}
      <div className="page contexte">
        <h2>CONTEXTE</h2>
        
        <h3>A. Clarification des termes clés</h3>
        
        <h4>La jeunesse</h4>
        <p>La Politique Nationale de la Jeunesse définit les jeunes comme des jeunes femmes et des jeunes hommes âgés de 15 à 35 ans, une tranche d'âge correspondant à la transition entre l'enfance et l'âge adulte.</p>
        
        <h4>La paix</h4>
        <p>La notion de paix ne renvoie pas seulement à l'absence de guerre. Elle repose sur l'existence de mécanismes favorisant la justice sociale, l'équité et la cohésion.</p>
        
        <h4>La sécurité</h4>
        <p>Le concept de sécurité appelle une déclinaison sémantique plurielle. Lors des consultations, les jeunes ont souligné que la sécurité est un processus inclusif, impliquant tant des actions civiles que militaires.</p>
        
        <h3>B. Les défis auxquels sont confrontés les jeunes</h3>
        
        <div className="defi">
          <h4>Le chômage et la précarité économique</h4>
          <p>Le taux de chômage reste élevé parmi les jeunes au Cameroun (10,4%, soit 13,8% chez les filles et 8,1% chez les garçons).</p>
        </div>
        
        <div className="defi">
          <h4>La violence et l'insécurité</h4>
          <p>Les jeunes camerounais, notamment dans les régions de l'Extrême-Nord, du Nord-Ouest et Sud-Ouest, sont confrontés à une exposition accrue à la violence et à l'insécurité en raison des conflits armés.</p>
        </div>
        
        <div className="defi">
          <h4>L'accès limité à l'éducation</h4>
          <p>Selon l'UNICEF, plus d'1,5 million de jeunes en âge scolaire sont dans le besoin d'une assistance scolaire dans le Nord-Ouest, le Sud-Ouest, l'Extrême Nord, et l'Ouest, le Littoral, à cause des crises.</p>
        </div>
        
        <div className="defi">
          <h4>Les problèmes migratoires</h4>
          <p>En 2024, on estimait à environ 2 millions le nombre de personnes déplacées de force au Cameroun, dont plus d'un million de déplacés internes, 460 000 réfugiés et demandeurs d'asile.</p>
        </div>
        
        <div className="defi">
          <h4>La discrimination et les inégalités</h4>
          <p>Moins de 2% des sièges parlementaires et à peine 3% des postes de maires sont occupés par des individus de moins de 35 ans.</p>
        </div>
        
        <div className="defi">
          <h4>La consommation des drogues</h4>
          <p>Les prévalences annuelles sont respectivement de 72,4% pour le tabac et le cannabis fumé, 79,3% pour les boissons alcoolisées et 50,5% pour le tramadol.</p>
        </div>
        
        <div className="defi">
          <h4>Les discours de haine et l'incivisme numérique</h4>
          <p>En 2023, l'ANTIC a relevé que les jeunes représentaient une part importante des plus de 12 000 cas de cybercriminalité signalés.</p>
        </div>
      </div>

      {/* Pages 18-21 - Alignement avec les politiques */}
      <div className="page alignement">
        <h2>ALIGNEMENT AVEC LES POLITIQUES EXISTANTES ET LES CADRES JURIDIQUES</h2>
        
        <h3>A. Les politiques nationales</h3>
        
        <h4>La Vision 2035 du Cameroun</h4>
        <p>Vise à transformer le pays en une économie émergente caractérisée par une croissance durable, une équité sociale et une bonne gouvernance.</p>
        
        <h4>La Stratégie Nationale de Développement 2020-2030 (SND30)</h4>
        <p>Établit que le développement durable et paix sont intrinsèquement liés, plaçant les jeunes au centre de la transformation nationale.</p>
        
        <h4>La Politique Nationale de la Jeunesse (PNJ)</h4>
        <p>Présente les jeunes comme des acteurs essentiels de la construction nationale et de la cohésion sociale.</p>
        
        <h4>Le Conseil National de la Jeunesse du Cameroun (CNJC)</h4>
        <p>Plateforme fédératrice des associations et mouvements de jeunesse, créée en 2009.</p>
        
        <h3>B. Les cadres continentaux africains</h3>
        <ul>
          <li>La Charte africaine de la jeunesse (2006)</li>
          <li>Le Cadre continental de l'Union Africaine pour les jeunes, la paix et la sécurité</li>
          <li>L'Architecture africaine de paix et de sécurité (APSA)</li>
          <li>L'Agenda 2063 de l'Union Africaine</li>
          <li>La Convention de Kinshasa (2010)</li>
          <li>La Convention de Malabo (2014)</li>
          <li>La Déclaration de Bujumbura (2022)</li>
        </ul>
        
        <h3>C. Les Cadres internationaux</h3>
        <ul>
          <li>La Résolution 2250 (2015) du Conseil de sécurité des Nations Unies</li>
          <li>Les Résolutions 2419 (2018) et 2535 (2020)</li>
          <li>Les Objectifs de Développement Durable (ODD)</li>
          <li>Le Pacte pour l'avenir (2024)</li>
        </ul>
      </div>

      {/* Pages 22-28 - Processus de développement */}
      <div className="page processus">
        <h2>PROCESSUS DE DÉVELOPPEMENT DU PAN ET MÉTHODOLOGIE</h2>
        
        <h3>Historique du PAN du Cameroun sur JPS</h3>
        <p>Le processus a débuté en 2017 à la suite d'un appel des jeunes camerounais lors de la célébration du deuxième anniversaire de la Résolution 2250 à Yaoundé.</p>
        
        <div className="chiffre-cle">
          <p className="grand-chiffre">4 570</p>
          <p>jeunes, adultes et membres des communautés consultés et formés entre 2017 et 2025</p>
        </div>
        
        <h3>Tableau 1. Engagement des intervenants à l'égard du PAN sur JPS</h3>
        <div className="tableau-scroll">
          <table className="table-processus">
            <thead>
              <tr>
                <th>Date/Année</th>
                <th>Activité/Événement</th>
                <th>Participants</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>2017</td><td>2e Anniversaire de la RCSNU 2250</td><td>Appel des jeunes</td></tr>
              <tr><td>2019</td><td>Symposium National sur la Jeunesse et les Processus de Paix</td><td>600+ jeunes</td></tr>
              <tr><td>2021</td><td>Symposium de contextualisation du Cadre Continental de l'UA</td><td>500 participants</td></tr>
              <tr><td>2022</td><td>Intégration dans Youth Connekt Cameroun</td><td>1715 jeunes formés</td></tr>
              <tr><td>2023</td><td>Création de la Commission Nationale sur la JPS</td><td>Multipartite</td></tr>
              <tr><td>2023</td><td>Projet YOUNG Cameroun</td><td>50 OSC, 500 jeunes</td></tr>
              <tr><td>2024</td><td>Colloque National sur la JPS</td><td>700+ participants</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Pages 29-30 - Plan d'Action National */}
      <div className="page plan">
        <h2>LE PLAN D'ACTION NATIONAL</h2>
        
        <h3>A. Justification</h3>
        <p>L'établissement d'un Plan d'Action National (PAN) Jeunesse, Paix et Sécurité (JPS) illustre l'engagement profond du Cameroun à soutenir activement sa jeunesse en tant qu'acteurs et partenaires dans les domaines de la paix et de la sécurité.</p>
        
        <h3>B. Vision et problème</h3>
        <h4>Vision</h4>
        <p className="citation">Un Cameroun pacifique, sûr et inclusif, où des jeunes autonomisés participent activement et co-dirigent des efforts en faveur d'une paix durable.</p>
        
        <h4>Énoncé du problème</h4>
        <p>Les jeunes au Cameroun sont confrontés à plusieurs défis d'ordre politique, juridique, socio-culturel, économique, numérique et environnemental.</p>
        
        <h3>C. La théorie du changement</h3>
        <div className="theorie-changement">
          <div className="si">
            <h4>Si...</h4>
            <ul>
              <li>les jeunes sont intégrés aux processus décisionnels</li>
              <li>les institutions collaborent de manière inclusive</li>
              <li>des efforts sont déployés pour le dialogue intergénérationnel</li>
              <li>des ressources adéquates sont mobilisées</li>
            </ul>
          </div>
          <div className="alors">
            <h4>Alors...</h4>
            <ul>
              <li>les jeunes gagneront en autonomie et résilience</li>
              <li>les institutions renforceront leur légitimité</li>
              <li>la cohésion sociale sera améliorée</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Pages 31-44 - Axes stratégiques et cadre de mise en œuvre */}
      <div className="page axes">
        <h2>PRINCIPAUX AXES STRATEGIQUES</h2>
        
        <div className="axe">
          <h3>Renforcement des capacités et leadership des jeunes</h3>
          <p>Former les jeunes aux compétences en consolidation de la paix, prévention des conflits, engagement citoyen, leadership et plaidoyer.</p>
        </div>
        
        <div className="axe">
          <h3>Renforcement institutionnel et redevabilité</h3>
          <p>Sensibiliser et former les responsables gouvernementaux, forces de sécurité, leaders traditionnels aux approches inclusives.</p>
        </div>
        
        <div className="axe">
          <h3>Protection et sécurité des jeunes</h3>
          <p>Créer une culture de la sécurité pour les jeunes et développer des dispositifs de protection.</p>
        </div>
        
        <div className="axe">
          <h3>Mobilisation des ressources et partenariats stratégiques</h3>
          <p>Forger des partenariats multi-acteurs pour garantir un financement durable.</p>
        </div>
        
        <div className="axe">
          <h3>Cohésion sociale et dialogue intergénérationnel</h3>
          <p>Promouvoir des initiatives de dialogue et combattre la désinformation.</p>
        </div>
        
        <h3>Tableau 2. Cadre de mise en œuvre et impact voulu</h3>
        
        <h4>Signe vital 1 : Renforcement de l'action des jeunes pour la paix</h4>
        <div className="tableau-budget">
          <p><strong>Budget total : 7 850 000 000 FCFA</strong></p>
          <p>Actions : Formation de 50 000 jeunes, soutien à 1800 initiatives communautaires</p>
        </div>
        
        <h4>Signe vital 2 : Renforcement de la confiance institutionnelle</h4>
        <div className="tableau-budget">
          <p><strong>Budget total : 1 580 000 000 FCFA</strong></p>
          <p>Actions : Dialogues publics, vulgarisation, mécanismes juridiques</p>
        </div>
        
        <h4>Signe vital 3 : Réduction de la violence et de la criminalité</h4>
        <div className="tableau-budget">
          <p><strong>Budget total : 25 900 000 000 FCFA</strong></p>
          <p>Actions : Formation de 100 000 jeunes, lutte contre stupéfiants, prévention extrémisme</p>
        </div>
        
        <h4>Signe vital 4 : Amélioration de la confiance mutuelle</h4>
        <div className="tableau-budget">
          <p><strong>Budget total : 3 985 000 000 FCFA</strong></p>
          <p>Actions : Education à la paix, lutte contre discours de haine, dialogues intercommunautaires</p>
        </div>
        
        <h4>Signe vital 5 : Renforcement de la collaboration</h4>
        <div className="tableau-budget">
          <p><strong>Budget total : 3 000 000 000 FCFA</strong></p>
          <p>Actions : Mécanismes de coordination, partenariats multi-acteurs</p>
        </div>
      </div>

      {/* Pages 45-49 - Mécanisme de suivi et évaluation */}
      <div className="page suivi">
        <h2>MÉCANISME DE SUIVI ET D'ÉVALUATION</h2>
        
        <h3>A. Instruments et outils de suivi-évaluation</h3>
        <ul>
          <li>Cadre de résultats avec indicateurs SMART</li>
          <li>Fiches d'activités standardisées</li>
          <li>Plateforme numérique de suivi participatif</li>
          <li>Revues trimestrielles, semestrielles, annuelles</li>
          <li>Évaluations mi-parcours (2028) et finale (2030)</li>
        </ul>
        
        <h3>B. Approche participative</h3>
        <p>Participation significative des jeunes à toutes les étapes : collecte, validation, analyse et diffusion des données.</p>
        
        <h3>F. Mécanismes de coordination</h3>
        
        <h4>Commission Nationale Jeunesse, Paix et Sécurité (CNJPS)</h4>
        <p>Structure nationale de coordination stratégique du PAN JPS.</p>
        
        <h4>Comités Locaux Jeunesse, Paix et Sécurité (CLJPS)</h4>
        <p>Relais de proximité dans chaque région pour le suivi participatif.</p>
        
        <h4>Figure 1. Structure de coordination et de surveillance du JPS</h4>
        <div className="schema-placeholder">
          [Schéma de coordination : CNJPS - MINJEC - CLJPS - CNJC - OSC - PTF]
        </div>
      </div>

      {/* Pages 50-51 - Cadre budgétaire */}
      <div className="page budget">
        <h2>CADRE BUDGETAIRE</h2>
        
        <p className="budget-total">Budget total : <strong>49 046 500 000 FCFA</strong></p>
        <p className="budget-total-en">(Quarante-neuf milliards quarante-six millions cinq cent mille francs CFA)</p>
        
        <div className="budget-detail">
          <h3>Signe vital 1</h3>
          <p>Renforcement de l'action des jeunes pour la paix : 7 850 000 000 FCFA</p>
          
          <h3>Signe vital 2</h3>
          <p>Confiance institutionnelle : 1 580 000 000 FCFA</p>
          
          <h3>Signe vital 3</h3>
          <p>Réduction de la violence et criminalité : 25 900 000 000 FCFA</p>
          
          <h3>Signe vital 4</h3>
          <p>Confiance mutuelle entre jeunes : 3 985 000 000 FCFA</p>
          
          <h3>Signe vital 5</h3>
          <p>Collaboration multipartite : 3 000 000 000 FCFA</p>
          
          <h3>Suivi et Évaluation</h3>
          <p>Fonctionnement CNJPS et activités S&E : 6 731 500 000 FCFA</p>
        </div>
        
        <div className="note-budget">
          <p>Le S&E représente 10% du budget global du PAN JPS.</p>
        </div>
      </div>

      {/* Page 52 - Conclusion */}
      <div className="page conclusion">
        <h2>CONCLUSION</h2>
        <p>Dans un contexte de conflits multiples et généralisés au Cameroun, il apparaît impératif d'examiner les dynamiques en jeu et les enjeux géopolitiques qui sous-tendent ces situations. L'élaboration d'un Plan d'Action National Jeunesse, Paix et Sécurité pour le Cameroun apparaît non seulement comme une nécessité, mais aussi comme une opportunité pour intégrer la jeunesse dans un processus de transformation sociale et culturelle, lui permettant de passer du statut de victime de divers conflits à celui d'acteur clé de la construction de la paix.</p>
        <p className="citation">Investir dans la jeunesse, ce n'est pas seulement parier sur l'avenir : c'est choisir, dès aujourd'hui, de consolider les fondations d'un Cameroun stable, prospère et réconcilié.</p>
        
        <div className="photo-placeholder">
          [Vacances citoyenne et patriotiques - MINJEC à Yaoundé © UNFPA Cameroun 2025]
        </div>
      </div>

      {/* Pages 53-58 - Annexes */}
      <div className="page annexes">
        <h2>ANNEXES</h2>
        
        <h3>Annexe 1 : Guide d'entretien</h3>
        <ol>
          <li>Comment désigne-t-on la paix et la sécurité dans votre aire culturelle ?</li>
          <li>Quel est le plus grand motif de conflit dans votre aire culturelle ?</li>
          <li>Quels processus ramènent la paix dans votre région ?</li>
          <li>Quel rôle joue la jeunesse dans les conflits et leur résolution ?</li>
          <li>Quelles méthodes sont utilisées pour ramener la paix ?</li>
        </ol>
        
        <h3>Annexe 2 : Principaux obstacles</h3>
        <table className="table-obstacles">
          <thead>
            <tr>
              <th>Catégorie</th>
              <th>Obstacles</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Politique/institutionnel</td><td>Faible représentativité, exclusion, extrémisme</td></tr>
            <tr><td>Socio-économique</td><td>Chômage, inégal accès aux ressources, migrations</td></tr>
            <tr><td>Culturel/Genre</td><td>Discrimination, traumatismes, addictions</td></tr>
            <tr><td>Numérique</td><td>Discours de haine, incivisme numérique</td></tr>
          </tbody>
        </table>
        
        <h3>Annexe 3 : Solutions proposées par les jeunes</h3>
        <ul>
          <li>Bonne gouvernance inclusive</li>
          <li>Implication des jeunes dans la gestion publique</li>
          <li>Centres de formation professionnelle décentralisés</li>
          <li>Intégration dans mécanismes locaux de résolution des conflits</li>
          <li>Appui psychosocial aux victimes</li>
          <li>Plateformes intergénérationnelles de dialogue</li>
          <li>Microcrédits adaptés</li>
          <li>Lois spécifiques en faveur des jeunes</li>
          <li>Education civique et numérique</li>
        </ul>
      </div>

      {/* Pages 59-61 - Références et équipe */}
      <div className="page references">
        <h2>RÉFÉRENCES BIBLIOGRAPHIQUES</h2>
        <ul className="bibliographie">
          <li>AGUILAR François, Scanning the Business Environment, 1967.</li>
          <li>BUZAN Barry, People, States and fear, 1991.</li>
          <li>CHARLES-PHILIPPE David, La guerre et la paix, 2000.</li>
          <li>ELLA ELLA Samuel-Béni et al., L'insertion socio-professionnelle des jeunes au Cameroun, 2025.</li>
          <li>GALTUNG Johan, "Violence, peace, and peace research", 1969.</li>
          <li>Gouvernement du Cameroun, SND30, 231p.</li>
          <li>MBEMBE Achille, Les jeunes et l'ordre politique en Afrique noire, 1985.</li>
          <li>NKOETAM ZAMBO Jean Armand, "Jeunesse camerounaise et consolidation de la paix", 2025.</li>
          <li>NKOUONLACK, C. et al., "Prevalence of non-medical use of prescription drugs", BMC Psychiatry, 2023.</li>
          <li>PONDI Jean-Emmanuel, Harcèlement sexuel en milieu universitaire, 2011.</li>
        </ul>
        
        <h3>ÉQUIPE DE RÉALISATION</h3>
        <div className="equipe">
          <p><strong>Supervision Générale :</strong> M. MOUNOUNA FOUTSOU</p>
          <p><strong>Coordination Administrative :</strong> M. BENGA Zachée Théophile, Dr AKEDE METOUGUE Éric</p>
          <p><strong>Coordination Technique :</strong> Mme DONTsOP Adeline, Mme RAHMATOU SADJO, Mme FADIMATOU IYAWA OUSMANOU</p>
          <p><strong>Consultants :</strong> Pr Jean Emmanuel PONDI, Dr Jean Armand NKOETAM ZAMBO, M. Stève MBASSI OMGBA, Mme NDOH Ida PIH</p>
          <p><strong>Comité technique :</strong> 15+ experts</p>
          <p><strong>Partenaires Techniques et Financiers :</strong> Search for Common Ground, UNFPA, GIZ, Union Africaine, etc.</p>
        </div>
      </div>

      {/* Pages 62-64 - Fermeture */}
      <div className="page fermeture">
        <p className="citation finale">Les jeunes sont de puissants agents de paix</p>
      </div>

      {/* Page 64 - Contacts */}
      <div className="page contacts">
        <h3>CONTACTS</h3>
        <div className="contact-info">
          <p>+237 222 20 08 00 / 222 20 08 01</p>
          <p>cameroon.un.org/fr</p>
          <p>@UNinCameroon</p>
          <p>@UN_Cameroon</p>
          <p>Système des Nations Unies Cameroun</p>
          <p>No 1232 Immeuble Mellopolis Rue 1794, Ekoudou, Bastos</p>
          <p>Avenue de l'Unité</p>
          <p className="mt-4">Commission Nationale Jeunesse, Paix et Sécurité</p>
          <p>Quartier Administratif en face des Archives Nationales, BP 12263- Yaoundé</p>
          <p>cameroonypscommission@gmail.com</p>
          <p>+237 697 84 10 21 / +237 243 36 98 18</p>
        </div>
      </div>
    </div>
  );
};

export default PlanActionNational;