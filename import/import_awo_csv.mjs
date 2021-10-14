import	{	writeFileSync		}	from 'fs'
import	{	readFileSync		}	from 'fs'




const out 	= process.argv[3] || process.argv[2]
const src 	= process.argv[3] ? process.argv[2] : 'awo.csv'

function clearString(str){
	return str.replace('"','').trim()
}


const csv 	= readFileSync(src, 'utf8')
const raw 	= CSVToArray(csv,',')

var taxonomy = {}


;(function(exports){

	
	
	
	



	exports.categories = [

		{
			name:	'encounters',			//Begegnung
			colors:	['#832A67'],
			tags:	[
						'encounters_games',			// Gemeinsames Spielen
						'encounters_dining',		// Essen und Trinken
						'encounters_tea',			// Kaffeetrinken und Beisammensein
						'encounters_groups',		// Feste Gruppentreffen
						'encounters_conversations',	// Offene Gesprächskreise
						'encounters_tanztee',		// Tanztee
						'encounters_dating',		// Kennenlerntreffen (Dating)
						'encounters_gardening',		// Gemeinsames Gärtnern

						'encounters_collectors',	// Sammelleidenschaften !!
						'encounters_parties'		// Feste und Feiern !!
					]
		},

		{
			name:	'counseling',			//Beratung
			colors:	['#60409D'],
			tags: 	[
						'counseling_social', 	// Sozialberatung
						'counseling_debt', 		// Schuldnerberatung
						'counseling_tenant',	// Mieterberatung
						'counseling_housing',	// Wohnberatung
						'counseling_migration',	// Migrationsberatung
						'counseling_pension',	// Rentenberatung
						'counseling_police',	// Polizeiberatung

						'counseling_volunteers',// Ehrenamtsberatung !!
						'counseling_legal'		// Rechtsberatung !!
					]
		},

		{
			name:	'exercise',				//Bewegung_und_Gesundheit
			colors:	['#31AAE2'],
			tags:	[
						'exercise_motor',			// Bewegungsangebote
						'exercise_dance',			// Tanzgruppe
						'exercise_walking',			// Spazieren gehen und wandern
						'exercise_self_help',		// Selbsthilfegruppen
						'exercise_memory',			// Gedächtnistraining
						'exercise_parcours',		// Aktivplätze und Bewegungsparcours
						'exercise_fall_prevention'	// Sturzprävention

					]
		},

		{
			name:	'intercultural',		//Sprachen_und_Interkulturelles
			colors:	['#9f67e8'],
			tags:	[
						'intercultural_language_course',	// Sprachkurse
						'intercultural_language_specific', 	// Sprachspezifische Angebote
						'intercultural_encounters'			// Interkulturelle Treffen

					],
		},

		{
	
			name:	'arts',					//Kreativität und Kunst
			colors:	['#ec465a'],
			tags: 	[
						'arts_paint_craft', // Mal- und Bastelkurse
						'arts_choir', 		// Singen und Chor
						'arts_handicrafts',	// Handarbeit !!
						'arts_cosmetic',	// Kosmetik
						'arts_misc'			// Andere künstlerische Angebote
					]
		},

		{
			name:	'culture',				//Gesellschaft_Kultur_Politik
			colors:	['#ff9900'],
			tags: 	[
						'culture_trips',					// Ausflüge und Exkursionen
						'culture_meetings',					// Informationstreffen
						'culture_music_theatre_film',		// Musik, Theater, Film
						'culture_literature', 				// Literatur
						'culture_politics', 				// Politische Themen
						'culture_culture',					// Kulturelle Themen
						'culture_relegion',					// Religiöse Themen
						'culture_environment',				// Klima, Natur und Umwelt
						'culture_senior_represantatives'	// Sprechstunden der Seniorenvertretungen
					]
		},

		{
			name:	'support',				//Alltagshilfen_Ehrenamt
			colors:	['#46b4b9'],
			tags: 	[
						'support_open_lunch',			// Offener Mittagstisch
						'support_meals_on_wheels',		// Essen auf Rädern
						'support_give_away',			// Kleiderkammer, Bücherbasar
						'support_neighborhood', 		// Einkaufshilfen und Nachbarschaftshilfen
						'support_visiting_service',		// Besuchsdienste
						'support_repairs',				// Reparaturhilfe
						'support_helpline', 			// Telefonseelsorge
						'support_public_restrooms'		// Öffentliche Toiletten
					]
		},

		{
			name:	'it',					//Computer_und_Technik
			colors:	['#ffc300'],
			tags: 	[
						'it_courses',	// Kurse und Lernmöglichkeiten
						'it_seniors',	// Technik und Alter
						'it_lending',	// Leihmöglichkeiten von Tablets und Smartphones
						//'it_free_wifi'	// Kostenlose WLAN - Hotspots
					]
		},

		{
			name:	'housing',				//Wohnen
			colors:	['#E36E00'],
			tags: 	[
						'housing_assisted', 	// Wohnen mit Service
						'housing_smart',		// Smart Wohnen
						'housing_project'		// Wohnprojekte

			]
		},

		{
			name:	'care',					//Rund_um_die_Pflege	
			colors:	['#00b0c6'],
			tags: 	[
						'care_consulting',				// Pflegeberatung
						'care_in_facility',				// Angebote in Pflegeeinrichtungen
						'care_services',				// Betreuungsangebote
						'care_relief_everyday_life',	// Entlastung im Alltag
						'care_relief_caregivers',		// Entlastung Pflegender
						'care_dementia'					// Angebote für Demenzkranke und deren Angehörige

			]
		},

		{
			name:	'misc_category',					//Sonstige_Angebote
			colors:	['#008671'],
			tags: 	[]
		},

	]

	exports.types = [
		{
			name:		'location',
			colors:		['#f27020', '#f27020'],
		},		
		{
			name:		'service',
			colors:		['#fec300', '#fec300'],
		},
		{
			name:		'event',
			colors:		['#62a7d5', '#62a7d5'],
		}
	]

	exports.tags = {

		target_groups: [
			'migrates', 		//Migrant*innen
			'women', 			//Frauen
			'men',				//Männer
			'lgtbiq', 			//LSBTI*
			'young_and_old',	//Jung und Alt
		],	

		institution_type: [
			'meeting_place',			//Begegnungsstätte
			'multigenerational_house', 	//Mehrgenerationenhaus
			'district_center',			//Stadtteilzentrum
			'family_center',			//Famielienzentrum
			'counseling_center',		//Beratungsstelle
			'misc_institution' 			//andere
		],

		accessibility:[				
			'wheelchair_accessible_wc',	//Rollstuhlgerechtes WC
			'accessible_parking',		//Parkplatz für Menschen mit Behinderung
			'wheelchair_accessible',	//Zugang rollstuhlgerecht
			'elevator_present',			//Fahrstuhl vorhanden			
		],

		languages: [
			'albanian',
			'amharic',
			'aramaic',
			'arabic',
			'armenian',
			'azerbaijani',
			'bengali',
			'bulgarian',
			'chechen',
			'chinese',
			'creole',
			'dari',
			'dutch',
			'english',
			'farsi',
			'french',
			'greek',
			'hebrew',
			'hindu',
			'hungarian',
			'italian',
			'japanese',
			'kikuyu',
			'korean',
			'kurdish',
			'laz',
			'lithuanian',
			'luo',
			'macedonian',
			'montenegrin',
			'nepali',
			'oromo',
			'pashto',
			'polish',
			'portuguese',
			'punjabi',
			'romani',
			'romanian',
			'russian',
			'slovene',
			'serbian_croatian',
			'spanish',
			'suomi',
			'swahili',
			'tajiki',
			'thai',
			'tigrinya',
			'turkish',
			'turkmen',
			'ukranian',
			'urdu',
			'uzbek',
			'vietnamese',
			'wolof',
		],


		misc :[
			'free_wifi', 		// Kostenlose W-Lan-Nutzung
			'free_pc_usage',	// Kostenlose PC Nutzung
		]

	}

	exports.lor = [

		{
			tag:	'bz_01',
			name:	'Mitte',
			pgr:[

				{
					id:		'0110',
					tag:	'pgr_0110',
					name:	'Zentrum',
					bzr:[
						{
							id:		'011001',
							tag:	'bzr_011001',
							name:	'Tiergarten Süd'
						},
						{
							id:		'011002',
							tag:	'bzr_011002',
							name:	'Regierungsviertel'
						},
						{
							id:		'011003',
							tag:	'bzr_011003',
							name:	'Alexanderplatz'
						},
						{
							id:		'011004',
							tag:	'bzr_011004',
							name:	'Brunnenstraße Süd'
						},
					]
				},
				{
					id:		'0120',
					tag:	'pgr_0120',
					name:	'Moabit',
					bzr:[
						{
							id:		'012005',
							tag:	'bzr_012005',
							name:	'Moabit West'
						},
						{
							id:		'012006',
							tag:	'bzr_012006',
							name:	'Moabit Ost'
						},
					]
				},
				{
					id:		'0130',
					tag:	'pgr_0130',
					name:	'Gesund­­brunnen',
					bzr:[
						{
							id:		'013007',
							tag:	'bzr_013007',
							name:	'Osloer Straße'
						},
						{
							id:		'013008',
							tag:	'bzr_013008',
							name:	'Brunnenstraße Nord'
						},
					]
				},
				{
					id:		'0140',
					tag:	'pgr_0140',
					name:	'Wedding',
					bzr:[
						{
							id:		'014009',
							tag:	'bzr_014009',
							name:	'Parkviertel'
						},
						{
							id:		'014010',
							tag:	'bzr_014010',
							name:	'Wedding Zentrum'
						},
					]
				},

			]

		},
		{
			tag:	'bz_02',
			name:	'Friedrichshain-Kreuzberg',
			pgr:[

				{
					id:		'0210',
					tag:	'pgr_0210',
					name:	'Kreuzberg Nord',
					bzr:[
						{
							id:		'021001',
							tag:	'bzr_021001',
							name:	'Südliche Friedrichstadt'
						},
					]
				},
				{
					id:		'0220',
					tag:	'pgr_0220',
					name:	'Kreuzberg Süd',
					bzr:[
						{
							id:		'022002',
							tag:	'bzr_022002',
							name:	'Tempelhofer Vorstadt'
						},
					]
				},
				{
					id:		'0230',
					tag:	'pgr_0230',
					name:	'Kreuzberg Ost',
					bzr:[
						{
							id:		'023003',
							tag:	'bzr_023003',
							name:	'Nördliche Luisenstadt'
						},
						{
							id:		'023004',
							tag:	'bzr_023004',
							name:	'Südliche Luisenstadt'
						},
					]
				},
				{
					id:		'0240',
					tag:	'pgr_0240',
					name:	'Friedrichshain West',
					bzr:[
						{
							id:		'024005',
							tag:	'bzr_024005',
							name:	'Karl-Marx-Allee Nord'
						},
						{
							id:		'024006',
							tag:	'bzr_024006',
							name:	'Karl-Marx-Allee Süd'
						},
					]
				},
				{
					id:		'0250',
					tag:	'pgr_0250',
					name:	'Friedrichshain Ost',
					bzr:[
						{
							id:		'025007',
							tag:	'bzr_025007',
							name:	'Frankfurter Allee Nord'
						},
						{
							id:		'025008',
							tag:	'bzr_025008',
							name:	'Frankfurter Allee Süd FK'
						},
					]
				},

			]
		},
		{
			tag:	'bz_03',
			name:	'Pankow',
			pgr:[

				{
					id:		'0310',
					tag:	'pgr_0310',
					name:	'Buch',
					bzr:[
						{
							id:		'031001',
							tag:	'bzr_031001',
							name:	'Buch'
						},
					]
				},
				{
					id:		'0320',
					tag:	'pgr_0320',
					name:	'Nördliches Pankow',
					bzr:[
						{
							id:		'032002',
							tag:	'bzr_032002',
							name:	'Blankenfelde / Niederschönhausen'
						},
						{
							id:		'032003',
							tag:	'bzr_032003',
							name:	'Buchholz'
						},
					]
				},
				{
					id:		'0330',
					tag:	'pgr_0330',
					name:	'Nördliches Weißensee',
					bzr:[
						{
							id:		'033004',
							tag:	'bzr_033004',
							name:	'Karow'
						},
						{
							id:		'033005',
							tag:	'bzr_033005',
							name:	'Blankenburg / Heinersdorf / Märchenland'
						},
					]
				},
				{
					id:		'0340',
					tag:	'pgr_0340',
					name:	'Südliches Pankow',
					bzr:[
						{
							id:		'034006',
							tag:	'bzr_034006',
							name:	'Schönholz / Wilhelmsruh / Rosenthal'
						},
						{
							id:		'034007',
							tag:	'bzr_034007',
							name:	'Pankow Zentrum'
						},
						{
							id:		'034008',
							tag:	'bzr_034008',
							name:	'Pankow Süd'
						},
					]
				},
				{
					id:		'0350',
					tag:	'pgr_0350',
					name:	'Südliches Weißensee',
					bzr:[
						{
							id:		'035009',
							tag:	'bzr_035009',
							name:	'Weißensee'
						},
						{
							id:		'035010',
							tag:	'bzr_035010',
							name:	'Weißensee Ost'
						},
					]
				},
				{
					id:		'0360',
					tag:	'pgr_0360',
					name:	'Nördlicher Prenzlauer Berg',
					bzr:[
						{
							id:		'036011',
							tag:	'bzr_036011',
							name:	'Prenzlauer Berg Nordwest'
						},
						{
							id:		'036012',
							tag:	'bzr_036012',
							name:	'Prenzlauer Berg Nord'
						},
						{
							id:		'036013',
							tag:	'bzr_036013',
							name:	'Helmholtzplatz'
						},
						{
							id:		'036014',
							tag:	'bzr_036014',
							name:	'Prenzlauer Berg Ost'
						},
					]
				},
				{
					id:		'0370',
					tag:	'pgr_0370',
					name:	'Südlicher Prenzlauer Berg',
					bzr:[
						{
							id:		'037015',
							tag:	'bzr_037015',
							name:	'Prenzlauer Berg Südwest'
						},
						{
							id:		'037016',
							tag:	'bzr_037016',
							name:	'Prenzlauer Berg Süd'
						},
					]
				},

			]
		},
		{
			tag:	'bz_04',
			name:	'Charlottenburg-Wilmersdorf',
			pgr:[

				{
					id:		'0410',
					tag:	'pgr_0410',
					name:	'Charlottenburg Nord',
					bzr:[
						{
							id:		'041001',
							tag:	'bzr_041001',
							name:	'Charlottenburg Nord'
						},
					]
				},
				{
					id:		'0420',
					tag:	'pgr_0420',
					name:	'Charlottenburg West',
					bzr:[
						{
							id:		'042002',
							tag:	'bzr_042002',
							name:	'Heerstraße'
						},
						{
							id:		'042003',
							tag:	'bzr_042003',
							name:	'Westend'
						},
					]
				},
				{
					id:		'0430',
					tag:	'pgr_0430',
					name:	'Charlottenburg Zentrum',
					bzr:[
						{
							id:		'043004',
							tag:	'bzr_043004',
							name:	'Schloss Charlottenburg'
						},
						{
							id:		'043005',
							tag:	'bzr_043005',
							name:	'Mierendorffplatz'
						},
						{
							id:		'043006',
							tag:	'bzr_043006',
							name:	'Otto-Suhr-Allee / Kantstraße'
						},
					]
				},
				{
					id:		'0440',
					tag:	'pgr_0440',
					name:	'Wilmersdorf Süd',
					bzr:[
						{
							id:		'044007',
							tag:	'bzr_044007',
							name:	'Grunewald'
						},
						{
							id:		'044008',
							tag:	'bzr_044008',
							name:	'Schmargendorf'
						},
					]
				},
				{
					id:		'0450',
					tag:	'pgr_0450',
					name:	'Wilmersdorf Zentrum',
					bzr:[
						{
							id:		'045009',
							tag:	'bzr_045009',
							name:	'Halensee'
						},
						{
							id:		'045010',
							tag:	'bzr_045010',
							name:	'Lietzenburger Straße'
						},
						{
							id:		'045011',
							tag:	'bzr_045011',
							name:	'Volkspark Wilmersdorf'
						},
					]
				},

			]
		},
		{
			tag:	'bz_05',
			name:	'Spandau',
			pgr:[

				{
					id:		'0510',
					tag:	'pgr_0510',
					name:	'Spandau Mitte / Nord',
					bzr:[
						{
							id:		'051001',
							tag:	'bzr_051001',
							name:	'Hakenfelde'
						},
						{
							id:		'051002',
							tag:	'bzr_051002',
							name:	'Falkenhagener Feld'
						},
						{
							id:		'051003',
							tag:	'bzr_051003',
							name:	'Spandau Mitte'
						},
					]
				},
				{
					id:		'0520',
					tag:	'pgr_0520',
					name:	'Wilhelmstadt / Staaken',
					bzr:[
						{
							id:		'052004',
							tag:	'bzr_052004',
							name:	'Brunsbütteler Damm'
						},
						{
							id:		'052005',
							tag:	'bzr_052005',
							name:	'Heerstraße'
						},
						{
							id:		'052006',
							tag:	'bzr_052006',
							name:	'Wilhelmstadt'
						},
					]
				},
				{
					id:		'0530',
					tag:	'pgr_0530',
					name:	'Haselhorst / Siemensstadt',
					bzr:[
						{
							id:		'053007',
							tag:	'bzr_053007',
							name:	'Haselhorst'
						},
						{
							id:		'053008',
							tag:	'bzr_053008',
							name:	'Siemensstadt'
						},
					]
				},
				{
					id:		'0540',
					tag:	'pgr_0540',
					name:	'Gatow / Kladow',
					bzr:[
						{
							id:		'054009',
							tag:	'bzr_054009',
							name:	'Gatow / Kladow'
						},
					]
				},

			]
		},
		{
			tag:	'bz_06',
			name:	'Steglitz-Zehlendorf',
			pgr:[

				{
					id:		'0610',
					tag:	'pgr_0610',
					name:	'Steglitz',
					bzr:[
						{
							id:		'061001',
							tag:	'bzr_061001',
							name:	'Schloßstraße'
						},
						{
							id:		'061002',
							tag:	'bzr_061002',
							name:	'Albrechtstraße'
						},
					]
				},
				{
					id:		'0620',
					tag:	'pgr_0620',
					name:	'Lankwitz / Lichterfelde Ost',
					bzr:[
						{
							id:		'062003',
							tag:	'bzr_062003',
							name:	'Lankwitz'
						},
						{
							id:		'062004',
							tag:	'bzr_062004',
							name:	'Ostpreußendamm'
						},
					]
				},
				{
					id:		'0630',
					tag:	'pgr_0630',
					name:	'Zehlendorf Süd / Lichterfelde West',
					bzr:[
						{
							id:		'063005',
							tag:	'bzr_063005',
							name:	'Teltower Damm'
						},
						{
							id:		'063006',
							tag:	'bzr_063006',
							name:	'Drakestraße'
						},
					]
				},
				{
					id:		'0640',
					tag:	'pgr_0640',
					name:	'Zehlendorf Nord / Wannsee',
					bzr:[
						{
							id:		'064007',
							tag:	'bzr_064007',
							name:	'Zehlendorf Südwest'
						},
						{
							id:		'064008',
							tag:	'bzr_064008',
							name:	'Zehlendorf Nord'
						},
					]
				},

			]
		},
		{
			tag:	'bz_07',
			name:	'Tempelhof-Schöneberg',
			pgr:[

				{
					id:		'0710',
					tag:	'pgr_0710',
					name:	'Schöneberg Nord',
					bzr:[
						{
							id:		'071001',
							tag:	'bzr_071001',
							name:	'Schöneberg Nordwest'
						},
						{
							id:		'071002',
							tag:	'bzr_071002',
							name:	'Schöneberg Nordost'
						},
					]
				},
				{
					id:		'0720',
					tag:	'pgr_0720',
					name:	'Schöneberg Süd',
					bzr:[
						{
							id:		'072003',
							tag:	'bzr_072003',
							name:	'Schöneberg Südwest'
						},
						{
							id:		'072004',
							tag:	'bzr_072004',
							name:	'Schöneberg Südost'
						},
					]
				},
				{
					id:		'0730',
					tag:	'pgr_0730',
					name:	'Friedenau',
					bzr:[
						{
							id:		'073005',
							tag:	'bzr_073005',
							name:	'Friedenau West'
						},
						{
							id:		'073006',
							tag:	'bzr_073006',
							name:	'Friedenau Ost'
						},
					]
				},
				{
					id:		'0740',
					tag:	'pgr_0740',
					name:	'Tempelhof',
					bzr:[
						{
							id:		'074007',
							tag:	'bzr_074007',
							name:	'Tempelhof Nord'
						},
						{
							id:		'074008',
							tag:	'bzr_074008',
							name:	'Tempelhof Südwest'
						},
						{
							id:		'074009',
							tag:	'bzr_074009',
							name:	'Tempelhof Südost'
						},
					]
				},
				{
					id:		'0750',
					tag:	'pgr_0750',
					name:	'Mariendorf',
					bzr:[
						{
							id:		'075010',
							tag:	'bzr_075010',
							name:	'Mariendorf Nord'
						},
						{
							id:		'075011',
							tag:	'bzr_075011',
							name:	'Mariendorf Süd'
						},
					]
				},
				{
					id:		'0760',
					tag:	'pgr_0760',
					name:	'Marienfelde / Lichtenrade',
					bzr:[
						{
							id:		'076012',
							tag:	'bzr_076012',
							name:	'Marienfelde Nord'
						},
						{
							id:		'076013',
							tag:	'bzr_076013',
							name:	'Marienfelde Süd'
						},
						{
							id:		'076014',
							tag:	'bzr_076014',
							name:	'Lichtenrade Nord'
						},
						{
							id:		'076015',
							tag:	'bzr_076015',
							name:	'Lichtenrade Süd'
						},
					]
				},

			]
		},
		{
			tag:	'bz_08',
			name:	'Neukölln',
			pgr:[

				{
					id:		'0810',
					tag:	'pgr_0810',
					name:	'Neukölln',
					bzr:[
						{
							id:		'081001',
							tag:	'bzr_081001',
							name:	'Schillerpromenade'
						},
						{
							id:		'081002',
							tag:	'bzr_081002',
							name:	'Neuköllner Mitte / Zentrum'
						},
						{
							id:		'081003',
							tag:	'bzr_081003',
							name:	'Reuterstraße'
						},
						{
							id:		'081004',
							tag:	'bzr_081004',
							name:	'Rixdorf'
						},
						{
							id:		'081005',
							tag:	'bzr_081005',
							name:	'Köllnische Heide'
						},
					]
				},
				{
					id:		'0820',
					tag:	'pgr_0820',
					name:	'Britz / Buckow',
					bzr:[
						{
							id:		'082006',
							tag:	'bzr_082006',
							name:	'Britz Nord'
						},
						{
							id:		'082007',
							tag:	'bzr_082007',
							name:	'Britz'
						},
						{
							id:		'082008',
							tag:	'bzr_082008',
							name:	'Buckow'
						},
					]
				},
				{
					id:		'0830',
					tag:	'pgr_0830',
					name:	'Gropiusstadt',
					bzr:[
						{
							id:		'083009',
							tag:	'bzr_083009',
							name:	'Gropiusstadt West'
						},
						{
							id:		'083010',
							tag:	'bzr_083010',
							name:	'Gropiusstadt Ost'
						},
					]
				},
				{
					id:		'0840',
					tag:	'pgr_0840',
					name:	'Buckow Nord / Rudow',
					bzr:[
						{
							id:		'084011',
							tag:	'bzr_084011',
							name:	'Buckow Nord'
						},
						{
							id:		'084012',
							tag:	'bzr_084012',
							name:	'Rudow'
						},
					]
				},

			]
		},
		{
			tag:	'bz_09',
			name:	'Treptow-Köpenick',
			pgr:[

				{
					id:		'0910',
					tag:	'pgr_0910',
					name:	'Treptow-Köpenick 1',
					bzr:[
						{
							id:		'091001',
							tag:	'bzr_091001',
							name:	'Alt-Treptow'
						},
						{
							id:		'091002',
							tag:	'bzr_091002',
							name:	'Plänterwald'
						},
						{
							id:		'091003',
							tag:	'bzr_091003',
							name:	'Baumschulenweg'
						},
						{
							id:		'091004',
							tag:	'bzr_091004',
							name:	'Johannisthal'
						},
					]
				},
				{
					id:		'0920',
					tag:	'pgr_0920',
					name:	'Treptow-Köpenick 2',
					bzr:[
						{
							id:		'092005',
							tag:	'bzr_092005',
							name:	'Oberschöneweide'
						},
						{
							id:		'092006',
							tag:	'bzr_092006',
							name:	'Niederschöneweide'
						},
						{
							id:		'092007',
							tag:	'bzr_092007',
							name:	'Adlershof'
						},
						{
							id:		'092008',
							tag:	'bzr_092008',
							name:	'Köllnische Vorstadt / Spindlersfeld'
						},
					]
				},
				{
					id:		'0930',
					tag:	'pgr_0930',
					name:	'Treptow-Köpenick 3',
					bzr:[
						{
							id:		'093009',
							tag:	'bzr_093009',
							name:	'Altglienicke'
						},
						{
							id:		'093010',
							tag:	'bzr_093010',
							name:	'Bohnsdorf'
						},
						{
							id:		'093011',
							tag:	'bzr_093011',
							name:	'Grünau'
						},
						{
							id:		'093012',
							tag:	'bzr_093012',
							name:	'Schmöckwitz'
						},
					]
				},
				{
					id:		'0940',
					tag:	'pgr_0940',
					name:	'Treptow-Köpenick 4',
					bzr:[
						{
							id:		'094013',
							tag:	'bzr_094013',
							name:	'Köpenick Süd'
						},
						{
							id:		'094014',
							tag:	'bzr_094014',
							name:	'Allende-Viertel'
						},
						{
							id:		'094015',
							tag:	'bzr_094015',
							name:	'Altstadt Köpenick'
						},
						{
							id:		'094016',
							tag:	'bzr_094016',
							name:	'Müggelheim'
						},
					]
				},
				{
					id:		'0950',
					tag:	'pgr_0950',
					name:	'Treptow-Köpenick 5',
					bzr:[
						{
							id:		'095017',
							tag:	'bzr_095017',
							name:	'Friedrichshagen'
						},
						{
							id:		'095018',
							tag:	'bzr_095018',
							name:	'Rahnsdorf'
						},
						{
							id:		'095019',
							tag:	'bzr_095019',
							name:	'Dammvorstadt'
						},
						{
							id:		'095020',
							tag:	'bzr_095020',
							name:	'Köpenick Nord'
						},
					]
				},

			]

		},
		{
			tag:	'bz_10',
			name:	'Marzahn-Hellersdorf',
			pgr:[

				{
					id:		'1010',
					tag:	'pgr_1010',
					name:	'Marzahn',
					bzr:[
						{
							id:		'101001',
							tag:	'bzr_101001',
							name:	'Marzahn Nord'
						},
						{
							id:		'101002',
							tag:	'bzr_101002',
							name:	'Marzahn Mitte'
						},
						{
							id:		'101003',
							tag:	'bzr_101003',
							name:	'Marzahn Süd'
						},
					]
				},
				{
					id:		'1020',
					tag:	'pgr_1020',
					name:	'Hellersdorf',
					bzr:[
						{
							id:		'102004',
							tag:	'bzr_102004',
							name:	'Hellersdorf Nord'
						},
						{
							id:		'102005',
							tag:	'bzr_102005',
							name:	'Hellersdorf Ost'
						},
						{
							id:		'102006',
							tag:	'bzr_102006',
							name:	'Hellersdorf Süd'
						},
					]
				},
				{
					id:		'1030',
					tag:	'pgr_1030',
					name:	'Biesdorf',
					bzr:[
						{
							id:		'103007',
							tag:	'bzr_103007',
							name:	'Biesdorf'
						},
						
					]
				},
				{
					id:		'1040',
					tag:	'pgr_1040',
					name:	'Kaulsdorf / Mahlsdorf',
					bzr:[
						{
							id:		'104008',
							tag:	'bzr_104008',
							name:	'Kaulsdorf'
						},
						{
							id:		'104009',
							tag:	'bzr_104009',
							name:	'Mahlsdorf'
						},
					]
				},

			]

		},
		{
			tag:	'bz_11',
			name:	'Lichtenberg',
			pgr:[

				{
					id:		'1110',
					tag:	'pgr_1110',
					name:	'Hohenschönhausen Nord',
					bzr:[
						{
							id:		'111001',
							tag:	'bzr_111001',
							name:	'Malchow, Wartenberg und Falkenberg'
						},
						{
							id:		'111002',
							tag:	'bzr_111002',
							name:	'Neu-Hohenschönhausen Nord'
						},
						{
							id:		'111003',
							tag:	'bzr_111003',
							name:	'Neu-Hohenschönhausen Süd'
						},
					]
				},
				{
					id:		'1120',
					tag:	'pgr_1120',
					name:	'Hohenschönhausen Süd',
					bzr:[
						{
							id:		'112004',
							tag:	'bzr_112004',
							name:	'Alt-Hohenschönhausen Nord'
						},
						{
							id:		'112005',
							tag:	'bzr_112005',
							name:	'Alt-Hohenschönhausen Süd'
						},
						
					]
				},
				{
					id:		'1130',
					tag:	'pgr_1130',
					name:	'Lichtenberg Nord',
					bzr:[
						{
							id:		'113006',
							tag:	'bzr_113006',
							name:	'Fennpfuhl'
						},
						{
							id:		'113007',
							tag:	'bzr_113007',
							name:	'Alt-Lichtenberg'
						},
						{
							id:		'113008',
							tag:	'bzr_113008',
							name:	'Frankfurter Allee Süd'
						},
					]
				},
				{
					id:		'1140',
					tag:	'pgr_1140',
					name:	'Lichtenberg Mitte',
					bzr:[
						{
							id:		'114009',
							tag:	'bzr_114009',
							name:	'Neu-Lichtenberg'
						},
						{
							id:		'114010',
							tag:	'bzr_114010',
							name:	'Friedrichsfelde Nord'
						},
						{
							id:		'114011',
							tag:	'bzr_114011',
							name:	'Friedrichsfelde Süd'
						},
					]
				},
				{
					id:		'1150',
					tag:	'pgr_1150',
					name:	'Lichtenberg Süd',
					bzr:[
						{
							id:		'115012',
							tag:	'bzr_115012',
							name:	'Rummelsburger Bucht'
						},
						{
							id:		'115013',
							tag:	'bzr_115013',
							name:	'Karlshorst'
						},
					]
				},

			]

		},
		{
			tag:	'bz_12',
			name:	'Reinickendorf',
			pgr:[

				{
					id:		'1210',
					tag:	'pgr_1210',
					name:	'Reinickendorf Ost',
					bzr:[
						{
							id:		'121001',
							tag:	'bzr_121001',
							name:	'Ost 1 -Reginhardstraße'
						},
						{
							id:		'121002',
							tag:	'bzr_121002',
							name:	'Ost 2 - Alt-Reinickendorf'
						},
						
					]
				},
				{
					id:		'1220',
					tag:	'pgr_1220',
					name:	'Tegel',
					bzr:[
						{
							id:		'122003',
							tag:	'bzr_122003',
							name:	'West 4 - Auguste-Viktoria-Allee'
						},
						{
							id:		'122004',
							tag:	'bzr_122004',
							name:	'West 1 - Tegel-Süd/Flughafensee'
						},
						{
							id:		'122005',
							tag:	'bzr_122005',
							name:	'West 5 - Tegel'
						},
					]
				},
				{
					id:		'1240',
					tag:	'pgr_1240',
					name:	'Grüner Norden',
					bzr:[
						{
							id:		'124006',
							tag:	'bzr_124006',
							name:	'West 2 - Heiligensee / Konradshöhe'
						},
						{
							id:		'124007',
							tag:	'bzr_124007',
							name:	'Nord 1 - Frohnau / Hermsdorf'
						},
					]
				},
				{
					id:		'1250',
					tag:	'pgr_1250',
					name:	'Wittenau / Borsigwalde',
					bzr:[
						{
							id:		'125008',
							tag:	'bzr_125008',
							name:	'West 3 - Borsigwalde / Freie Scholle'
						},
						{
							id:		'125009',
							tag:	'bzr_125009',
							name:	'Nord 2 - Waidmannslust / Wittenau / Lübars'
						},
					]
				},
				{
					id:		'1260',
					tag:	'pgr_1260',
					name:	'Märkisches Viertel',
					bzr:[
						{
							id:		'126010',
							tag:	'bzr_126010',
							name:	'Rollbergesiedlung'
						},
						{
							id:		'126011',
							tag:	'bzr_126011',
							name:	'MV Nord'
						},
						{
							id:		'126012',
							tag:	'bzr_126012',
							name:	'MV Süd'
						},
					]
				},

			]

		}

	]
})(taxonomy)


const main_categories = {
		encounters:		"Begegnung",
		counseling:		"Beratung",
		exercise:		"Bewegung_und_Gesundheit",
		intercultural:	"Sprachen_und_Interkulturelles",
		arts:			"Kunst und Kreativität",
		culture:		"Gesellschaft_Kultur_Politik",
		support:		"Alltagshilfen_Ehrenamt",
		it:				"Computer_und_Technik",
		housing:		"Wohnen",
		care:			"Rund_um_die_Pflege",
		misc_category:	"Sonstige_Angebote",
}

const sub_categories = {
		'encounters_games':			 		"Gemeinsames Spielen",
		'encounters_dining':				"Essen und Trinken",
		'encounters_tea':					"Kaffeetrinken und Beisammensein",
		'encounters_groups':		 		"Feste Gruppentreffen",
		'encounters_conversations':	 		"Offene Gesprächskreise",
		'encounters_tanztee':				"Tanztee",
		'encounters_dating':		 		"Kennenlerntreffen (Dating)",
		'encounters_gardening':				"Gemeinsames Gärtnern",
		'encounters_collectors':			"Sammelleidenschaften",
		'encounters_parties':				"Feste und Feiern",
		
		'counseling_social': 		 		"Sozialberatung",
		'counseling_debt': 					"Schuldnerberatung",
		'counseling_tenant':				"Mieterberatung",
		'counseling_housing':		 		"Wohnberatung",
		'counseling_migration':		 		"Migrationsberatung",
		'counseling_pension':		 		"Rentenberatung",
		'counseling_police':				"Polizeiberatung",

		'counseling_volunteers':			"Ehrenamtsberatung",
		'counseling_legal':					"Rechtsberatung",

		'exercise_motor':					"Bewegungsangebote",
		'exercise_dance':			 		"Tanzgruppe",
		'exercise_walking':			 		"Spazieren gehen und wandern",
		'exercise_self_help':		 		"Selbsthilfegruppen",
		'exercise_memory':			 		"Gedächtnistraining",
		'exercise_parcours':		 		"Aktivplätze und Bewegungsparcours",
		'exercise_fall_prevention':	 		"Sturzprävention",
		'intercultural_language_course':	"Sprachkurse",
		'intercultural_language_specific': 	"Sprachspezifische Angebote",
		'intercultural_encounters':			"Interkulturelle Treffen",
		'arts_paint_craft':  				"Mal- und Bastelkurse",
		'arts_choir': 		 				"Singen und Chor",

		'arts_handicrafts':  				"Handarbeit",		

		'arts_cosmetic':	 				"Kosmetik",
		'arts_misc':			 			"Andere künstlerische Angebote",
		'culture_trips':					"Ausflüge und Exkursionen",
		'culture_meetings':					"Informationstreffen",
		'culture_music_theatre_film':		"Musik, Theater, Film",
		'culture_literature': 				"Literatur",
		'culture_politics': 				"Politische Themen",
		'culture_culture':					"Kulturelle Themen",
		'culture_relegion':					"Religiöse Themen",
		'culture_environment':				"Klima, Natur und Umwelt",
		'culture_senior_represantatives':	"Sprechstunden der Seniorenvertretungen",
		'support_open_lunch':			 	"Offener Mittagstisch",
		'support_meals_on_wheels':		 	"Essen auf Rädern",
		'support_give_away':			 	"Kleiderkammer, Bücherbasar",
		'support_neighborhood': 		 	"Einkaufshilfen und Nachbarschaftshilfen",
		'support_visiting_service':		 	"Besuchsdienste",
		'support_repairs':				 	"Reparaturhilfe",
		'support_helpline': 			 	"Telefonseelsorge",
		'support_public_restrooms':		 	"Öffentliche Toiletten",
		'support_mobility':					"Mobilitätshilfedienste",
		'it_courses':	 					"Kurse und Lernmöglichkeiten",
		'it_seniors':	 					"Technik und Alter",
		'it_lending':	 					"Leihmöglichkeiten von Tablets und Smartphones",
		//'it_free_wifi':					"Kostenlose WLAN - Hotspots",
		'housing_assisted': 	 			"Wohnen mit Service",
		'housing_smart':		 			"Smart Wohnen",
		'housing_project':		 			"Wohnprojekte",
		'care_consulting':				 	"Pflegeberatung",
		'care_in_facility':				 	"Angebote in Pflegeeinrichtungen",
		'care_services':				 	"Betreuungsangebote",
		'care_relief_everyday_life':	 	"Entlastung im Alltag",
		'care_relief_caregivers':		 	"Entlastung Pflegender",
		'care_dementia':					"Angebote für Demenzkranke und deren Angehörige",
}

const institutionTypes = {
	'meeting_place':			"Begegnungsstätte",
	'multigenerational_house': 	"Mehrgenerationenhaus",
	'district_center':			"Stadtteilzentrum",
	'family_center':			"Famielienzentrum",
	'counseling_center':		"Beratungsstelle",
	'neighborhood_center':		"Nachbarschaftstreff",
	'misc_institution': 		"andere",
}


const targetGroups = {
	'migrants': 		"Migrant*innen",
	'women': 			"Frauen",
	'men':				"Männer",
	'lgtbiq': 			"LSBTI*",
	'young_and_old':	"Jung und Alt",
}


const spokenLanguages = {
		albanian: 		"Albanisch",	
		amharic: 		"Amharisch",	
		arabic: 		"Arabisch",	
		aramaic: 		"Aramäisch",	
		armenian: 		"Armenisch",	
		azerbaijani: 	"Aserbaidschanisch",	
		bengali: 		"Bengali",	
		bulgarian: 		"Bulgarisch",	
		chechen: 		"Tschetschenisch",	
		chinese: 		"Chinesisch",	
		creole: 		"Kreolisch",	
		dari: 			"Dari",	
		dutch: 			"Niederländisch",	
		english: 		"Englisch",	
		farsi: 			"Farsi",	
		french: 		"Französisch",	
		greek:			"Griechisch",	
		hebrew: 		"Hebräisch",
		hindu: 			"Hindi",	
		hungarian: 		"Ungarisch",	
		italian: 		"Italienisch",	
		japanese: 		"Japanisch",	
		kikuyu: 		"Kikuyu",	
		korean: 		"Koreanisch",	
		kurdish: 		"Kurdisch",	
		laz: 			"Lasisch",	
		lithuanian: 	"Litauisch",	
		luo: 			"Luo",	
		macedonian: 	"Mazedonisch",	
		montenegrin: 	"Montenegrinisch",	
		nepali: 		"Nepali",	
		oromo: 			"Oromo",	
		pashto:	 		"Paschtu",	
		polish: 		"Polnisch",	
		portuguese: 	"Portugiesisch",	
		punjabi: 		"Punjabi",	
		romani: 		"Romanes",	
		romanian: 		"Rumänisch",
		russian: 		"Russisch",	
		serbian_croatian: "Bosnisch/Kroatisch/Serbisch",	
		slovene: 		"Slowenisch",	
		spanish: 		"Spanisch",	
		suomi: 			"Finnisch",	
		swahili:		"Kisuaheli",	
		tajiki: 		"Tadschikisch",	
		thai: 			"Thailändisch",	
		tigrinya: 		"Tigrinya",	
		turkish: 		"Türkisch",	
		turkmen: 		"Turkmenisch",	
		ukranian: 		"Ukrainisch",	
		urdu: 			"Urdu",	
		uzbek: 			"Usbekisch",	
		vietnamese: 	"Vietnamesisch",	
		wolof:			"Wolof",	
}

function simplifyString(str){

	if(!str) return undefined

	return 	str
			.toLowerCase()
			.replace(/ß/g, 'ss')
			.replace(/(ü|ü)/g, 'ue')
			.replace(/(ö|ö)/g, 'oe')
			.replace(/ä/g, 'ae')
			.replace(/[^a-zA-Z]/g,'')
}

function matchSimplfied(str1, str2){

	const a = simplifyString(str1)
	const b = simplifyString(str2)

	return a && b && a == b
}

function fixMarkdown(str, errors) {
	return 	(str||'')
			.replace(/\*\* /, '**')
			.replace(/ \*\*/, '**')

}

/**
 * CSVToArray parses any String of Data including '\r' '\n' characters,
 * and returns an array with the rows of data.
 * @param {String} CSV_string - the CSV string you need to parse
 * @param {String} delimiter - the delimeter used to separate fields of data
 * @returns {Array} rows - rows of CSV where first row are column headers
 */
function CSVToArray (CSV_string, delimiter) {
   delimiter = (delimiter || ","); // user-supplied delimeter or default comma

   var pattern = new RegExp( // regular expression to parse the CSV values.
     ( // Delimiters:
       "(\\" + delimiter + "|\\r?\\n|\\r|^)" +
       // Quoted fields.
       "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
       // Standard fields.
       "([^\"\\" + delimiter + "\\r\\n]*))"
     ), "gi"
   );

   var rows = [[]];  // array to hold our data. First row is column headers.
   // array to hold our individual pattern matching groups:
   var matches = false; // false if we don't find any matches
   // Loop until we no longer find a regular expression match
   while (matches = pattern.exec( CSV_string )) {
       var matched_delimiter = matches[1]; // Get the matched delimiter
       // Check if the delimiter has a length (and is not the start of string)
       // and if it matches field delimiter. If not, it is a row delimiter.
       if (matched_delimiter.length && matched_delimiter !== delimiter) {
         // Since this is a new row of data, add an empty row to the array.
         rows.push( [] );
       }
       var matched_value;
       // Once we have eliminated the delimiter, check to see
       // what kind of value was captured (quoted or unquoted):
       if (matches[2]) { // found quoted value. unescape any double quotes.
        matched_value = matches[2].replace(
          new RegExp( "\"\"", "g" ), "\""
        );
       } else { // found a non-quoted value
         matched_value = matches[3];
       }
       // Now that we have our value string, let's add
       // it to the data array.
       rows[rows.length - 1].push(matched_value);
   }
   return rows; // Return the parsed data Array
}


function getType(str, errors){

	const matches = []

	const types = {
		location:		'Ort oder Einrichtung',
		service:		'(regelmäßiges) Angebot',
		event:			'einmaliges Angebot'
	}

	Object.entries(types).forEach( ([key,value]) => {
		if(matchSimplfied(value, str)) matches.push(key)
	})


	if(matches.length != 1){
		errors.push(`Kann Typ nicht zuordnen: "${str}"`)		
	}

	return matches[0]

}

function getCategories(str, errors){

	if(!str) return []

	let	a = simplifyString(str)



	a = a.replace('gesellschaftundpolitik', 'gesellschaftkulturpolitik')
	a = a.replace('naehenundschneidern', 'handarbeit')
	a = a.replace("gesellschaftundkultur", "gesellschaftkulturpolitik")
	a = a.replace("ehrenamtberatung", "ehrenamtsberatung")


	const matches = []

	;[
		...Object.entries(sub_categories),
		...Object.entries(main_categories),
	]
	.sort( (a, b) =>  (a[1].length < b[1].length) ? 1 : -1 ) // sort by length of category name, longer matches should be done earlier
	.forEach( ([key,value]) => {

		const b = simplifyString(value)


		if(a.match(b)) {
			matches.push(key)			
			a = a.replace(new RegExp(b,'g'),'')
		}
	})


	if(a !==''){
		errors.push(`Kann Thema nicht zuordnen: "${a}"; ursprünglich: "${str}"`)

	}

	return matches

}

function getCategory(str, errors){

	const matches = getCategories(str, errors)

	if(matches.length != 1){
		errors.push(`Kann Thema nicht zuordnen (muss genau 1 Thema enthalten) "${str}"; ursprünglich: "${str}"`)
		return undefined
	}

	return matches[0]

}

function getTargetGroups(str, errors){


	if(!str) return []

	let	a = simplifyString(str)

	a = a.replace('alle', '')

	const matches = []

	Object.entries(targetGroups).forEach( ([key,value]) => {

		const b = simplifyString(value)

		if(a.match(b)) {
			matches.push(key)
			a = a.replace(b,'')
		}

	})


	if(a !== ''){
		errors.push(`Kann Zielgruppe nicht zuordnen "${str}"`)
		return []
	}

	return matches
}

function getInstitutionType(str, errors){
	
	if(!str) return undefined	


	let a = simplifyString(str)

	a = a.replace("stadteilzentrum", "stadtteilzentrum")

	const matches = []	

	Object.entries(institutionTypes).forEach( ([key,value]) => {
		if(matchSimplfied(value, a)) matches.push(key)
	})

	if(matches.length != 1){
		errors.push(`Kann Art der Einrichtung nicht zuordnen: "${a}"`)
	}

	return matches[0]

}

function getBoolean(str, errors){

	return 	simplifyString(str) === 'ja'
			?	true
			:	false
}

function getDistrict(str, errors){

	const matches = []

	taxonomy.lor.forEach( district => {
		if( matchSimplfied(district.name, str) ) matches.push(district.tag)
	})

	if(matches.length != 1){
		errors.push(`Kann Bezirk nicht zuordnen: "${str}"`)
	}

	return matches[0]
	
}

function getPGR(str, errors){
	const matches = []

	str = str.replace('Neukoelln_BR', 'Neukoelln')

	taxonomy.lor
	.map( district => district.pgr)
	.flat()
	.forEach( pgr => {
		if( matchSimplfied(pgr.name, str) ) matches.push(pgr.tag)
	})

	if(matches.length != 1){
		errors.push(`Kann Prognoseraum nicht zuordnen: "${str}"`)		
		return undefined
	}

	return matches[0]
}


function getBZR(str, errors){
	const matches = []

	if(str.match('Rollbergesiedlung MV Nord'))	console.log("Kaputte BZR: Rollbergesiedlung MV Nord")
	if(str.match('Paul-Robeson-Straße Nord'))	console.log("Kaputte BZR: Paul-Robeson-Straße Nord")
	if(str.match('Grellstraße Nord'))			console.log("Kaputte BZR: Grellstraße Nord")


	str = str.replace('Rollbergesiedlung MV Nord', 'Rollbergesiedlung')
	str = str.replace('Paul-Robeson-Straße Nord', 'Prenzlauer Berg Nord')
	str = str.replace('Grellstraße Nord', 'Prenzlauer Berg Nord')

	taxonomy.lor
	.map( district => district.pgr)
	.flat()
	.map( pgr => pgr.bzr)
	.flat()
	.forEach( bzr => {
		if( matchSimplfied(bzr.name, str) ) matches.push(bzr.tag)
	})

	if(matches.length != 1){
		errors.push('getBZR() Unable to match bzr ', str, matches)
		return undefined
	}

	return matches[0]
}

function getLanguages(str, errors){

	if(!str) return [];

	str = str.replace(/kroatisch/, 'Bosnisch/Kroatisch/Serbisch')
	str = str.replace(/Polisch/, 'Polnisch')

	let	a = simplifyString(str)


	if(a.match('deutsch')){
		a = a.replace('deutsch', '')
		errors.push('Gesprochene Sprachen enthält "deutsch" (soll aber nicht extra angebeben werden)')
		if(a.length == 0) return []
	}

	const matches = []

	Object.entries(spokenLanguages).forEach( ([key,value]) => {

		const b = simplifyString(value)

		if(a.match(b)) {
			matches.push(key)
			a = a.replace(b,'')
		}

	})


	if(a !== ''){
		errors.push(`Kann sprache nicht zuordnen "${str}"`)		
	}

	return matches
}

const items	= raw.slice(4).map( (data, index) => {	

	const errors = []

	const type						= 	getType(data[0], errors)

	const location_ref				= 	type == 'location' 
										?	undefined
										:	data[1]

	const title						= 	type == 'location' 
										?	data[1] 
										:	data[2]

	if(type == 'location' && data[2]) errors.push('Ort oder Einrichtung hat Angebotsnamen')

	const brief						= 	{de:data[3]}
	const description				= 	{de:fixMarkdown(data[4], errors) }
	const charge					= 	{de:fixMarkdown(data[5], errors) }

	const acessibility				=	{de:fixMarkdown(data[15], errors) }

	const primaryTopic				= 	getCategory(data[6], errors)

	const address					=	data[20]
	const location					=	data[21]
	const zip						=	data[22]
	const city						=	data[23]


	if(data[24] && !data[24].match('^http')){
		errors.push(`Website muss mit "http" oder "https" beginnen: "${data[24]}"`)
	}
	const website					=	!data[24] || data[24].match('^http') 
										?	data[24]
										:	'https://'+data[24]

	const hours						=	{de:fixMarkdown(data[25], errors) }
	const email						=	data[26]
	const contact					=	data[27]
	const phone						=	data[28]
	const mobile					=	data[29]
	const facebook					=	data[30]
	const twitter					=	data[31]
	const whatsapp					=	data[32]
	const nebenanDe					=	data[33]

	//tags:


	const subCategories				= 	getCategories(data[7], errors)
	const extraCategories			= 	getCategories(data[8], errors)

	const targetGroups				= 	getTargetGroups(data[9], errors)
	const institutionType			=	getInstitutionType(data[10], errors)

	const accessibleWC 				=	getBoolean(data[11], errors)
	const accessibleParking			=	getBoolean(data[12], errors)
	const accessibleEntrance		=	getBoolean(data[13], errors)
	const elevator					=	getBoolean(data[14], errors)

	const accessibility				=	{de:data[15]}

	const bezirk					=	data[16] && getDistrict(data[16], errors)
	const prognoseraum				=	data[17] && getPGR(data[17], errors)
	const bezirksregion				=	data[18] && getBZR(data[18], errors)

	const venue						=	{de: fixMarkdown(data[19], errors) }


	const languages					=	data[34] && getLanguages(data[34], errors)

	const freeWifiUse				=	getBoolean(data[35], errors)
	const freePCUse					=	getBoolean(data[36], errors)


	//TODO
	const responsibleInstitution	=	data[37]
	const sponsors					=	[data[38]]

	//TODO()
	const tags						= 	[
											primaryTopic, 
											...[type],
											...subCategories, 
											...extraCategories, 
											...targetGroups,
											...( institutionType	? [institutionType]				: [] ),
											bezirk,
											...( accessibleWC 		? ['wheelchair_accessible_wc']	: [] ),
											...( accessibleParking 	? ['accessible_parking']		: [] ),
											...( accessibleEntrance ? ['wheelchair_accessible']		: [] ),
											...( elevator 			? ['elevator_present']			: [] ),
											...( prognoseraum		? [prognoseraum]				: [] ),
											...( bezirksregion		? [bezirksregion]				: [] ),
											...( freeWifiUse 		? ['free_wifi_usage']			: [] ),
											...( freePCUse 			? ['free_pc_usage']				: [] ),

											// ...languages
										]


	let latitude 					=	data[39] && parseFloat(data[39]) || undefined
	let longitude 					=	data[40] && parseFloat(data[40]) || undefined


	const state		= 'public'

	if(errors.length > 0){
		console.log('Zeile', index+5, ':')
		errors.forEach( e => console.log('- ', e))
		console.log('\n')
	}


	return {
		title,
		location_ref,
		brief,
		description,
		charge,
		primaryTopic,
		accessibility,
		venue,
		address,
		location,
		zip,
		city,
		website,
		hours,
		email,
		contact,
		phone,
		mobile,
		facebook,
		twitter,
		whatsapp,
		nebenanDe,
		responsibleInstitution,
		sponsors,

		longitude,
		latitude,


		tags,
		state

	}

})


let locationRefMismatches = []


items.forEach( item => {
	if(item.location_ref){
		const l = items.filter( i => matchSimplfied(i.title, item.location_ref) ).length

		if( l != 1){
			console.error('LocationRef mismatch: ', item.location_ref, `(${l})`)
			locationRefMismatches.push({itemTitle: item.title, itemRef: item.location_ref})
		}else{
			item.location_ref = items.find( i => matchSimplfied(i.title, item.location_ref) ).title
		}

	}
})


//console.log(items.slice(0,5))

if(out) writeFileSync(out, JSON.stringify(items), 'utf8')
if(out) writeFileSync('mismatch_'+out, JSON.stringify(locationRefMismatches), 'utf8')
