export const nameData = {
  categories: [
    { id: 'place',    label: 'Place' },
    { id: 'person',   label: 'Person' },
    { id: 'god',      label: 'God / Spirit' },
    { id: 'clan',     label: 'Clan / Tribe' },
    { id: 'creature', label: 'Creature' },
    { id: 'artifact', label: 'Artifact' },
  ],

  onsets: ['r','m','v','k','l','n','t','s','p','j','ž','š','ļ','ņ','z','d','b','g','ƕ'],
  onsetWeights: [9,8,8,7,7,7,6,6,5,5,4,4,4,4,3,3,3,2,2],

  vowels: ['a','ā','e','ē','i','ī','õ','ō','u','ū'],
  vowelWeights: [5,8,4,7,4,6,9,5,3,5],

  codas: ['','','','','n','s','d','ļ','z','ž','m','g','t','nd','ns'],

  placePrefix: ['','','rānda','jõgi','meri','mō','tuli','pū','kivi','ilma','āra'],
  placeSuffix: ['mō','lā','rānda','õ','as','nā','vā','īste','kēļ','jõ','aig'],
  personSuffix: ['s','a','is','as','ā','e','ēs','ins','āns','nis','ta'],
  godSuffix: ['āz','ēlis','ōns','ītis','āmaz','ēvs','ūris','ānis','īvs'],
  clanSuffix: ['kīnd','bērni','rāndi','mōži','kulti','vēļi','jūri'],
  creatureSuffix: ['aks','õks','āž','ūž','īš','õnd','ānd','uks'],
  artifactSuffix: ['māiņš','kīls','rīts','vāls','dāls','sēls','tāls'],

  meanings: {
    place: [
      'coastal settlement','river crossing','high ground','old grove',
      'sea-ward cliff','fog harbor','stone shore','grey marsh',
      'eastern road','night harbor',
    ],
    person: [
      'fisher of deep waters','one who walks before dawn','child of the shore',
      'keeper of nets','speaker of old words','swift runner',
      'quiet watcher','healer of wounds',
    ],
    god: [
      'lord of pitch tones','keeper of the stilled sea','voice in the fog',
      'she who bends the tide','guardian of long vowels',
      'spirit of the broken wave','ancient one beneath ice',
    ],
    clan: [
      'those of the grey shore','keepers of the old fire',
      'children of the gulf','tide-walkers','bone-fishers','speakers of the deep',
    ],
    creature: [
      'great sea-cat','fog-walker','stone-backed drifter',
      'deep-eye fish','shore-hound','luminous eel','tide-crawler',
    ],
    artifact: [
      'net woven from storm-hair','blade forged at low tide',
      'cup that holds sea-memory','horn of the gulf wind',
      'crown of woven kelp','mirror of still water',
    ],
  } as Record<string, string[]>,
};
