import { PrismaClient } from '@prisma/client';
import { parseArgs } from 'node:util';
const prisma = new PrismaClient();

const options = {
  environment: { type: 'string' } as const,
};

async function main() {
  const {
    values: { environment },
  } = parseArgs({ options });

  switch (environment) {
    case 'development':
      /** Seedind countries */
      // await prisma.country.createMany({
      //   data: [
      //     { name: 'Afghanistan', code: 'AF' },
      //     { name: 'Albania', code: 'AL' },
      //     { name: 'Algeria', code: 'DZ' },
      //     { name: 'Andorra', code: 'AD' },
      //     { name: 'Angola', code: 'AO' },
      //     { name: 'Antigua and Barbuda', code: 'AG' },
      //     { name: 'Argentina', code: 'AR' },
      //     { name: 'Armenia', code: 'AM' },
      //     { name: 'Australia', code: 'AU' },
      //     { name: 'Austria', code: 'AT' },
      //     { name: 'Azerbaijan', code: 'AZ' },
      //     { name: 'Bahamas', code: 'BS' },
      //     { name: 'Bahrain', code: 'BH' },
      //     { name: 'Bangladesh', code: 'BD' },
      //     { name: 'Barbados', code: 'BB' },
      //     { name: 'Belarus', code: 'BY' },
      //     { name: 'Belgium', code: 'BE' },
      //     { name: 'Belize', code: 'BZ' },
      //     { name: 'Benin', code: 'BJ' },
      //     { name: 'Bhutan', code: 'BT' },
      //     { name: 'Bolivia', code: 'BO' },
      //     { name: 'Bosnia and Herzegovina', code: 'BA' },
      //     { name: 'Botswana', code: 'BW' },
      //     { name: 'Brazil', code: 'BR' },
      //     { name: 'Brunei Darussalam', code: 'BN' },
      //     { name: 'Bulgaria', code: 'BG' },
      //     { name: 'Burkina Faso', code: 'BF' },
      //     { name: 'Burundi', code: 'BI' },
      //     { name: 'Cambodia', code: 'KH' },
      //     { name: 'Cameroon', code: 'CM' },
      //     { name: 'Canada', code: 'CA' },
      //     { name: 'Cape Verde', code: 'CV' },
      //     { name: 'Central African Republic', code: 'CF' },
      //     { name: 'Chad', code: 'TD' },
      //     { name: 'Chile', code: 'CL' },
      //     { name: 'China', code: 'CN' },
      //     { name: 'Colombia', code: 'CO' },
      //     { name: 'Comoros', code: 'KM' },
      //     { name: 'Congo', code: 'CG' },
      //     { name: 'Costa Rica', code: 'CR' },
      //     { name: 'Croatia', code: 'HR' },
      //     { name: 'Cuba', code: 'CU' },
      //     { name: 'Cyprus', code: 'CY' },
      //     { name: 'Czech Republic', code: 'CZ' },
      //     { name: 'Democratic Republic of the Congo', code: 'CD' },
      //     { name: 'Denmark', code: 'DK' },
      //     { name: 'Djibouti', code: 'DJ' },
      //     { name: 'Dominica', code: 'DM' },
      //     { name: 'Dominican Republic', code: 'DO' },
      //     { name: 'Ecuador', code: 'EC' },
      //     { name: 'Egypt', code: 'EG' },
      //     { name: 'El Salvador', code: 'SV' },
      //     { name: 'Equatorial Guinea', code: 'GQ' },
      //     { name: 'Eritrea', code: 'ER' },
      //     { name: 'Estonia', code: 'EE' },
      //     { name: 'Eswatini', code: 'SZ' },
      //     { name: 'Ethiopia', code: 'ET' },
      //     { name: 'Fiji', code: 'FJ' },
      //     { name: 'Finland', code: 'FI' },
      //     { name: 'France', code: 'FR' },
      //     { name: 'Gabon', code: 'GA' },
      //     { name: 'Gambia', code: 'GM' },
      //     { name: 'Germany', code: 'DE' },
      //     { name: 'Ghana', code: 'GH' },
      //     { name: 'Greece', code: 'GR' },
      //     { name: 'Grenada', code: 'GD' },
      //     { name: 'Guatemala', code: 'GT' },
      //     { name: 'Guinea', code: 'GN' },
      //     { name: 'Guinea-Bissau', code: 'GW' },
      //     { name: 'Guyana', code: 'GY' },
      //     { name: 'Haiti', code: 'HT' },
      //     { name: 'Honduras', code: 'HN' },
      //     { name: 'Hungary', code: 'HU' },
      //     { name: 'Iceland', code: 'IS' },
      //     { name: 'India', code: 'IN' },
      //     { name: 'Indonesia', code: 'ID' },
      //     { name: 'Iran', code: 'IR' },
      //     { name: 'Iraq', code: 'IR' },
      //     { name: 'Ireland', code: 'IE' },
      //     { name: 'Israel', code: 'IL' },
      //     { name: 'Italy', code: 'IT' },
      //     { name: 'Jamaica', code: 'JM' },
      //     { name: 'Japan', code: 'JP' },
      //     { name: 'Jordan', code: 'JO' },
      //     { name: 'Kazakhstan', code: 'KZ' },
      //     { name: 'Kenya', code: 'KE' },
      //     { name: 'Kiribati', code: 'KI' },
      //     { name: 'Korea (North)', code: 'KP' },
      //     { name: 'Korea (South)', code: 'KR' },
      //     { name: 'Kuwait', code: 'KW' },
      //     { name: 'Kyrgyzstan', code: 'KG' },
      //     { name: 'Laos', code: 'LA' },
      //     { name: 'Latvia', code: 'LV' },
      //     { name: 'Lebanon', code: 'LB' },
      //     { name: 'Lesotho', code: 'LS' },
      //     { name: 'Liberia', code: 'LR' },
      //     { name: 'Libya', code: 'LY' },
      //     { name: 'Liechtenstein', code: 'LI' },
      //     { name: 'Lithuania', code: 'LT' },
      //     { name: 'Luxembourg', code: 'LU' },
      //     { name: 'Madagascar', code: 'MG' },
      //     { name: 'Malawi', code: 'MW' },
      //     { name: 'Malaysia', code: 'MY' },
      //     { name: 'Maldives', code: 'MV' },
      //     { name: 'Mali', code: 'ML' },
      //     { name: 'Malta', code: 'MT' },
      //     { name: 'Marshall Islands', code: 'MH' },
      //     { name: 'Mauritania', code: 'MR' },
      //     { name: 'Mauritius', code: 'MU' },
      //     { name: 'Mexico', code: 'MX' },
      //     { name: 'Micronesia', code: 'FM' },
      //     { name: 'Moldova', code: 'MD' },
      //     { name: 'Monaco', code: 'MC' },
      //     { name: 'Mongolia', code: 'ME' },
      //     { name: 'Montenegro', code: 'CGO' },
      //     { name: 'Morocco', code: 'MA' },
      //     { name: 'Mozambique', code: 'MZ' },
      //     { name: 'Myanmar', code: 'MM' },
      //     { name: 'Namibia', code: 'NA' },
      //     { name: 'Nauru', code: 'NR' },
      //     { name: 'Nepal', code: 'NP' },
      //     { name: 'Netherlands', code: 'NL' },
      //     { name: 'New Zealand', code: 'NZ' },
      //     { name: 'Nicaragua', code: 'NI' },
      //     { name: 'Niger', code: 'NE' },
      //     { name: 'Nigeria', code: 'NG' },
      //     { name: 'North Macedonia', code: 'MK' },
      //     { name: 'Norway', code: 'NO' },
      //     { name: 'Oman', code: 'OM' },
      //     { name: 'Pakistan', code: 'PK' },
      //     { name: 'Palau', code: 'PW' },
      //     { name: 'Panama', code: 'PQ' },
      //     { name: 'Papua New Guinea', code: 'PG' },
      //     { name: 'Paraguay', code: 'PY' },
      //     { name: 'Peru', code: 'PE' },
      //     { name: 'Philippines', code: 'PH' },
      //     { name: 'Poland', code: 'PL' },
      //     { name: 'Portugal', code: 'PT' },
      //     { name: 'Qatar', code: 'QA' },
      //     { name: 'Romania', code: 'RO' },
      //     { name: 'Russia', code: 'RU' },
      //     { name: 'Rwanda', code: 'RW' },
      //     { name: 'Saint Kitts and Nevis', code: 'KN' },
      //     { name: 'Saint Lucia', code: 'LC' },
      //     { name: 'Saint Vincent and the Grenadines', code: 'VC' },
      //     { name: 'Samoa', code: 'WS' },
      //     { name: 'San Marino', code: 'CGO' },
      //     { name: 'Sao Tome and Principe', code: 'ST' },
      //     { name: 'Saudi Arabia', code: 'SA' },
      //     { name: 'Senegal', code: 'SN' },
      //     { name: 'Serbia', code: 'RS' },
      //     { name: 'Seychelles', code: 'SC' },
      //     { name: 'Sierra Leone', code: 'SG' },
      //     { name: 'Singapore', code: 'SG' },
      //     { name: 'Slovakia', code: 'SK' },
      //     { name: 'Slovenia', code: 'SI' },
      //     { name: 'Solomon Islands', code: 'SB' },
      //     { name: 'Somalia', code: 'SO' },
      //     { name: 'South Africa', code: 'ZA' },
      //     { name: 'South Sudan', code: 'SS' },
      //     { name: 'Spain', code: 'ES' },
      //     { name: 'Sri Lanka', code: 'LK' },
      //     { name: 'Sudan', code: 'SD' },
      //     { name: 'Suriname', code: 'SR' },
      //     { name: 'Sweden', code: 'SE' },
      //     { name: 'Switzerland', code: 'CH' },
      //     { name: 'Syria', code: 'SY' },
      //     { name: 'Taiwan', code: 'TW' },
      //     { name: 'Tajikistan', code: 'TJ' },
      //     { name: 'Tanzania', code: 'TZ' },
      //     { name: 'Thailand', code: 'TH' },
      //     { name: 'Timor-Leste', code: 'TL' },
      //     { name: 'Togo', code: 'TG' },
      //     { name: 'Tonga', code: 'TO' },
      //     { name: 'Trinidad and Tobago', code: 'IT' },
      //     { name: 'Tunisia', code: 'TN' },
      //     { name: 'Turkey', code: 'TR' },
      //     { name: 'Turkmenistan', code: 'TM' },
      //     { name: 'Tuvalu', code: 'TV' },
      //     { name: 'Uganda', code: 'UG' },
      //     { name: 'Ukraine', code: 'UA' },
      //     { name: 'United Arab Emirates', code: 'AE' },
      //     { name: 'United Kingdom', code: 'GB' },
      //     { name: 'United States', code: 'US' },
      //     { name: 'Uruguay', code: 'UY' },
      //     { name: 'Uzbekistan', code: 'UZ' },
      //     { name: 'Vanuatu', code: 'VU' },
      //     { name: 'Vatican City', code: 'VA' },
      //     { name: 'Venezuela', code: 'VE' },
      //     { name: 'Vietnam', code: 'VN' },
      //     { name: 'Yemen', code: 'YE' },
      //     { name: 'Zambia', code: 'ZM' },
      //     { name: 'Zimbabwe', code: 'ZW' },
      //   ],
      //   skipDuplicates: true,
      // });

      /** Seeding animal breeds */
      await prisma.breed.createMany({
        data: [
          {
            name: 'Large White ',
            animalTypeId: '5f5460ce-e706-42f6-81d2-508ced6aec25',
          },
          {
            name: 'Landrace',
            animalTypeId: '5f5460ce-e706-42f6-81d2-508ced6aec25',
          },
          {
            name: 'Duroc ',
            animalTypeId: '5f5460ce-e706-42f6-81d2-508ced6aec25',
          },
          {
            name: 'Berkshire',
            animalTypeId: '5f5460ce-e706-42f6-81d2-508ced6aec25',
          },
          {
            name: 'Hampshire',
            animalTypeId: '5f5460ce-e706-42f6-81d2-508ced6aec25',
          },
          {
            name: 'Pietrain',
            animalTypeId: '5f5460ce-e706-42f6-81d2-508ced6aec25',
          },
          {
            name: 'Tamworth',
            animalTypeId: '5f5460ce-e706-42f6-81d2-508ced6aec25',
          },
          {
            name: 'Chester White',
            animalTypeId: '5f5460ce-e706-42f6-81d2-508ced6aec25',
          },
          {
            name: 'Gloucestershire Old Spot',
            animalTypeId: '5f5460ce-e706-42f6-81d2-508ced6aec25',
          },
          {
            name: 'Vietnamese Pot-bellied Pig',
            animalTypeId: '5f5460ce-e706-42f6-81d2-508ced6aec25',
          },
          {
            name: 'Meishan',
            animalTypeId: '5f5460ce-e706-42f6-81d2-508ced6aec25',
          },
          {
            name: 'Mangalitsa',
            animalTypeId: '5f5460ce-e706-42f6-81d2-508ced6aec25',
          },
          {
            name: 'Hereford',
            animalTypeId: '5f5460ce-e706-42f6-81d2-508ced6aec25',
          },
          {
            name: 'Kunekune',
            animalTypeId: '5f5460ce-e706-42f6-81d2-508ced6aec25',
          },
          {
            name: 'Poland China',
            animalTypeId: '5f5460ce-e706-42f6-81d2-508ced6aec25',
          },
          {
            name: 'Red Wattle',
            animalTypeId: '5f5460ce-e706-42f6-81d2-508ced6aec25',
          },
          {
            name: 'Iberian (Pata Negra)',
            animalTypeId: '5f5460ce-e706-42f6-81d2-508ced6aec25',
          },
          {
            name: 'American Guinea Hog',
            animalTypeId: '5f5460ce-e706-42f6-81d2-508ced6aec25',
          },
          {
            name: 'Fauve de Bourgogne',
            animalTypeId: '78909c66-a5fc-4898-94b0-ff426442a6bd',
          },
          {
            name: 'Néo-Zélandais',
            animalTypeId: '78909c66-a5fc-4898-94b0-ff426442a6bd',
          },
          {
            name: 'Californien',
            animalTypeId: '78909c66-a5fc-4898-94b0-ff426442a6bd',
          },
          {
            name: 'Chinchilla',
            animalTypeId: '78909c66-a5fc-4898-94b0-ff426442a6bd',
          },
          {
            name: 'Satin',
            animalTypeId: '78909c66-a5fc-4898-94b0-ff426442a6bd',
          },
          {
            name: 'Blanc de Hotot',
            animalTypeId: '78909c66-a5fc-4898-94b0-ff426442a6bd',
          },
          {
            name: 'Argenté de Champagne',
            animalTypeId: '78909c66-a5fc-4898-94b0-ff426442a6bd',
          },
          {
            name: 'Géant des Flandres',
            animalTypeId: '78909c66-a5fc-4898-94b0-ff426442a6bd',
          },
          {
            name: 'Papillon Français',
            animalTypeId: '78909c66-a5fc-4898-94b0-ff426442a6bd',
          },
          {
            name: 'Rex',
            animalTypeId: '78909c66-a5fc-4898-94b0-ff426442a6bd',
          },
          {
            name: 'Boer',
            animalTypeId: 'c5302923-f88c-41b2-a99b-d65919f2a814',
          },
          {
            name: 'Kiko',
            animalTypeId: 'c5302923-f88c-41b2-a99b-d65919f2a814',
          },
          {
            name: 'Savannah',
            animalTypeId: 'c5302923-f88c-41b2-a99b-d65919f2a814',
          },
          {
            name: 'Myotonic',
            animalTypeId: 'c5302923-f88c-41b2-a99b-d65919f2a814',
          },
          {
            name: 'Spanish Goat ',
            animalTypeId: 'c5302923-f88c-41b2-a99b-d65919f2a814',
          },
          {
            name: 'Alpine',
            animalTypeId: 'c5302923-f88c-41b2-a99b-d65919f2a814',
          },
          {
            name: 'Nubienne',
            animalTypeId: 'c5302923-f88c-41b2-a99b-d65919f2a814',
          },
          {
            name: 'Toggenbourg',
            animalTypeId: 'c5302923-f88c-41b2-a99b-d65919f2a814',
          },
          {
            name: 'Barbari',
            animalTypeId: 'c5302923-f88c-41b2-a99b-d65919f2a814',
          },
          {
            name: 'Beetal',
            animalTypeId: 'c5302923-f88c-41b2-a99b-d65919f2a814',
          },
          {
            name: 'Nigerian Dwarf',
            animalTypeId: 'c5302923-f88c-41b2-a99b-d65919f2a814',
          },
          {
            name: 'Texel',
            animalTypeId: 'c5302923-f88c-41b2-a99b-d65919f2a814',
          },
          {
            name: 'Suffolk',
            animalTypeId: 'c5302923-f88c-41b2-a99b-d65919f2a814',
          },
          {
            name: 'Charollais',
            animalTypeId: 'c5302923-f88c-41b2-a99b-d65919f2a814',
          },
          {
            name: 'Charollais',
            animalTypeId: 'c5302923-f88c-41b2-a99b-d65919f2a814',
          },
          {
            name: 'Dorper',
            animalTypeId: 'c5302923-f88c-41b2-a99b-d65919f2a814',
          },
          {
            name: 'Dorset',
            animalTypeId: 'c5302923-f88c-41b2-a99b-d65919f2a814',
          },
          {
            name: 'Ile-de-France',
            animalTypeId: 'c5302923-f88c-41b2-a99b-d65919f2a814',
          },
          {
            name: 'Romanov',
            animalTypeId: 'c5302923-f88c-41b2-a99b-d65919f2a814',
          },
          {
            name: 'Canard de Barbarie',
            animalTypeId: '82aa8bbb-e1e8-4bb2-8fe3-f50d56f7c88c',
          },
          {
            name: 'Canard Fulvous',
            animalTypeId: '82aa8bbb-e1e8-4bb2-8fe3-f50d56f7c88c',
          },
          {
            name: 'Canard de Pékin',
            animalTypeId: '82aa8bbb-e1e8-4bb2-8fe3-f50d56f7c88c',
          },
          {
            name: 'Canard Mulard',
            animalTypeId: '82aa8bbb-e1e8-4bb2-8fe3-f50d56f7c88c',
          },
          {
            name: 'Canard Khaki Campbell',
            animalTypeId: '82aa8bbb-e1e8-4bb2-8fe3-f50d56f7c88c',
          },
          {
            name: 'Canard de Rouen',
            animalTypeId: '82aa8bbb-e1e8-4bb2-8fe3-f50d56f7c88c',
          },
          {
            name: 'Canard Coureur Indien',
            animalTypeId: '82aa8bbb-e1e8-4bb2-8fe3-f50d56f7c88c',
          },
          {
            name: 'Canard africain',
            animalTypeId: '82aa8bbb-e1e8-4bb2-8fe3-f50d56f7c88c',
          },
          {
            name: 'Dindon Bronzaillé',
            animalTypeId: 'b34080c8-a57b-4958-ae8d-b515c84671ab',
          },
          {
            name: 'Dindon Blanc de Hollande',
            animalTypeId: 'b34080c8-a57b-4958-ae8d-b515c84671ab',
          },
          {
            name: 'Dindon Royal Palm',
            animalTypeId: 'b34080c8-a57b-4958-ae8d-b515c84671ab',
          },
          {
            name: 'Dindon Bleu de Suède',
            animalTypeId: 'b34080c8-a57b-4958-ae8d-b515c84671ab',
          },
          {
            name: 'Dindon Bourbon Rouge',
            animalTypeId: 'b34080c8-a57b-4958-ae8d-b515c84671ab',
          },
          {
            name: 'Dindon Narragansett',
            animalTypeId: 'b34080c8-a57b-4958-ae8d-b515c84671ab',
          },
          {
            name: 'Dindon Noir de Sologne',
            animalTypeId: 'b34080c8-a57b-4958-ae8d-b515c84671ab',
          },
          {
            name: 'Dindon Broad Breasted White',
            animalTypeId: 'b34080c8-a57b-4958-ae8d-b515c84671ab',
          },
          {
            name: 'Dindon Midget White',
            animalTypeId: 'b34080c8-a57b-4958-ae8d-b515c84671ab',
          },
          {
            name: 'Dindon Norfolk noir',
            animalTypeId: 'b34080c8-a57b-4958-ae8d-b515c84671ab',
          },
          {
            name: 'Holstein-Frisonne',
            animalTypeId: '348b504b-c940-4c12-9154-614877bc0326',
          },
          {
            name: 'Jersey',
            animalTypeId: '348b504b-c940-4c12-9154-614877bc0326',
          },
          {
            name: 'Guernesey',
            animalTypeId: '348b504b-c940-4c12-9154-614877bc0326',
          },
          {
            name: 'Montbéliarde',
            animalTypeId: '348b504b-c940-4c12-9154-614877bc0326',
          },
          {
            name: 'Normande',
            animalTypeId: '348b504b-c940-4c12-9154-614877bc0326',
          },
          {
            name: 'Ayrshire',
            animalTypeId: '348b504b-c940-4c12-9154-614877bc0326',
          },
          {
            name: 'Brune des Alpes (Brown Swiss)',
            animalTypeId: '348b504b-c940-4c12-9154-614877bc0326',
          },
          {
            name: 'Pie Rouge des Plaines',
            animalTypeId: '348b504b-c940-4c12-9154-614877bc0326',
          },
          {
            name: 'Holstein-Frisonne',
            animalTypeId: '348b504b-c940-4c12-9154-614877bc0326',
          },
          {
            name: 'Charolaise',
            animalTypeId: '348b504b-c940-4c12-9154-614877bc0326',
          },
          {
            name: 'Limousine',
            animalTypeId: '348b504b-c940-4c12-9154-614877bc0326',
          },
          {
            name: 'Angus',
            animalTypeId: '348b504b-c940-4c12-9154-614877bc0326',
          },
          {
            name: 'Zébu Boran',
            animalTypeId: '348b504b-c940-4c12-9154-614877bc0326',
          },
          {
            name: 'Zébu Sahiwal',
            animalTypeId: '348b504b-c940-4c12-9154-614877bc0326',
          },
          {
            name: 'Zébu Brahman',
            animalTypeId: '348b504b-c940-4c12-9154-614877bc0326',
          },
          {
            name: 'Freisian',
            animalTypeId: '348b504b-c940-4c12-9154-614877bc0326',
          },
          {
            name: 'Kouri',
            animalTypeId: '348b504b-c940-4c12-9154-614877bc0326',
          },
          {
            name: 'Brahman',
            animalTypeId: '348b504b-c940-4c12-9154-614877bc0326',
          },
          {
            name: 'Ndama',
            animalTypeId: '348b504b-c940-4c12-9154-614877bc0326',
          },
          {
            name: 'Simmental',
            animalTypeId: '348b504b-c940-4c12-9154-614877bc0326',
          },
          {
            name: 'Ankole-Watusi',
            animalTypeId: '348b504b-c940-4c12-9154-614877bc0326',
          },
          {
            name: 'Tilapia',
            animalTypeId: 'ddd9b49c-718e-46a3-8027-a037e4ab195c',
          },
          {
            name: 'Carpe commune',
            animalTypeId: 'ddd9b49c-718e-46a3-8027-a037e4ab195c',
          },
          {
            name: 'Poisson-chat',
            animalTypeId: 'ddd9b49c-718e-46a3-8027-a037e4ab195c',
          },
          {
            name: 'Silure',
            animalTypeId: 'ddd9b49c-718e-46a3-8027-a037e4ab195c',
          },
          {
            name: 'Truite arc-en-ciel',
            animalTypeId: 'ddd9b49c-718e-46a3-8027-a037e4ab195c',
          },
          {
            name: 'Perche du Nil',
            animalTypeId: 'ddd9b49c-718e-46a3-8027-a037e4ab195c',
          },
          {
            name: 'Esturgeon',
            animalTypeId: 'ddd9b49c-718e-46a3-8027-a037e4ab195c',
          },
          {
            name: 'Bar',
            animalTypeId: 'ddd9b49c-718e-46a3-8027-a037e4ab195c',
          },
          {
            name: 'Dorade royale',
            animalTypeId: 'ddd9b49c-718e-46a3-8027-a037e4ab195c',
          },
          {
            name: 'Saumon Atlantique',
            animalTypeId: 'ddd9b49c-718e-46a3-8027-a037e4ab195c',
          },
          {
            name: 'Maquereau',
            animalTypeId: 'ddd9b49c-718e-46a3-8027-a037e4ab195c',
          },
          {
            name: 'Thon rouge ',
            animalTypeId: 'ddd9b49c-718e-46a3-8027-a037e4ab195c',
          },
          {
            name: 'Flétan',
            animalTypeId: 'ddd9b49c-718e-46a3-8027-a037e4ab195c',
          },
          {
            name: 'Turbot',
            animalTypeId: 'ddd9b49c-718e-46a3-8027-a037e4ab195c',
          },
          {
            name: 'Cobia',
            animalTypeId: 'ddd9b49c-718e-46a3-8027-a037e4ab195c',
          },
          {
            name: 'Mouton Djallonké',
            animalTypeId: 'ff369347-3cfe-446c-89fe-8c1bdc124dd7',
          },
          {
            name: 'Mouton Peulh',
            animalTypeId: 'ff369347-3cfe-446c-89fe-8c1bdc124dd7',
          },
          {
            name: 'Mouton Sahelien',
            animalTypeId: 'ff369347-3cfe-446c-89fe-8c1bdc124dd7',
          },
          {
            name: 'Mouton Somali',
            animalTypeId: 'ff369347-3cfe-446c-89fe-8c1bdc124dd7',
          },
          {
            name: 'Mouton Maasai',
            animalTypeId: 'ff369347-3cfe-446c-89fe-8c1bdc124dd7',
          },
          {
            name: 'Mouton Barbarin',
            animalTypeId: 'ff369347-3cfe-446c-89fe-8c1bdc124dd7',
          },
          {
            name: 'Mouton Ouled Djellal',
            animalTypeId: 'ff369347-3cfe-446c-89fe-8c1bdc124dd7',
          },
          {
            name: 'Mouton Blackhead Persian',
            animalTypeId: 'ff369347-3cfe-446c-89fe-8c1bdc124dd7',
          },
        ],
        skipDuplicates: true,
      });

      /** Seedind currencies */
      await prisma.currency.createMany({
        data: [
          { name: 'Algerian Dinar', code: 'DZD', symbol: 'د.ج' },
          { name: 'Angolan Kwanza', code: 'AOA', symbol: 'Kz' },
          { name: 'Botswana Pula', code: 'BWP', symbol: 'P' },
          { name: 'Burundian Franc', code: 'BIF', symbol: 'FBu' },
          { name: 'Cape Verdean Escudo', code: 'CVE', symbol: 'Esc' },
          { name: 'Central African CFA Franc', code: 'XAF', symbol: 'FCFA' },
          { name: 'Comorian Franc', code: 'KMF', symbol: 'CF' },
          { name: 'Congolese Franc', code: 'CDF', symbol: 'FC' },
          { name: 'Djiboutian Franc', code: 'DJF', symbol: 'Fdj' },
          { name: 'Egyptian Pound', code: 'IQD', symbol: 'E£' },
          { name: 'Eritrean Nakfa', code: 'ERN', symbol: 'Nfk' },
          { name: 'Ethiopian Birr', code: 'ETB', symbol: 'Br' },
          { name: 'Gambian Dalasi', code: 'GMD', symbol: 'D' },
          { name: 'Ghanaian Cedi', code: 'GHS', symbol: 'GH₵' },
          { name: 'Guinean Franc', code: 'GNF', symbol: 'FG' },
          { name: 'Kenyan Shilling', code: 'KES', symbol: 'KSh' },
          { name: 'Lesotho Loti', code: 'LSL', symbol: 'L' },
          { name: 'Liberian Dollar', code: 'LRD', symbol: 'L$' },
          { name: 'Libyan Dinar', code: 'LYD', symbol: 'LD' },
          { name: 'Malagasy Ariary', code: 'MGA', symbol: 'Ar' },
          { name: 'Malawian Kwacha', code: 'MWK', symbol: 'MK' },
          { name: 'Mauritanian Ouguiya', code: 'MRU', symbol: 'UM' },
          { name: 'Mauritian Rupee', code: 'MUR', symbol: 'Rs' },
          { name: 'Moroccan Dirham', code: 'MAD', symbol: 'د.م.' },
          { name: 'Mozambican Metical', code: 'MZN', symbol: 'MT' },
          { name: 'Namibian Dollar', code: 'NAD', symbol: 'N$' },
          { name: 'Nigerian Naira', code: 'NGN', symbol: '₦' },
          { name: 'Rwandan Franc', code: 'RWF', symbol: 'FRw' },
          { name: 'São Tomé and Príncipe Dobra', code: 'STN', symbol: 'Db' },
          { name: 'West African CFA Franc', code: 'XOF', symbol: 'CFA' },
          { name: 'Seychellois Rupee', code: 'SCR', symbol: 'Rs' },
          { name: 'Sierra Leonean Leone', code: 'SLL', symbol: 'Le' },
          { name: 'Somali Shilling', code: 'SOS', symbol: 'Sh' },
          { name: 'South African Rand', code: 'ZAR', symbol: 'R' },
          { name: 'South Sudanese Pound', code: 'SSP', symbol: 'SSP' },
          { name: 'Sudanese Pound', code: 'SDG', symbol: 'SDG' },
          { name: 'Swazi Lilangeni', code: 'SZL', symbol: 'E' },
          { name: 'Tanzanian Shilling', code: 'TZS', symbol: 'TSh' },
          { name: 'Tunisian Dinar', code: 'TND', symbol: 'د.ت' },
          { name: 'Ugandan Shilling', code: 'UGX', symbol: 'USh' },
          { name: 'Zambian Kwacha', code: 'ZMW', symbol: 'ZK' },
          { name: 'Zimbabwean Dollar', code: 'ZWL', symbol: 'Z$' },
          { name: 'United States Dollar', code: 'USD', symbol: '$' },
          { name: 'Euro', code: 'EUR', symbol: '€' },
          { name: 'Japanese Yen', code: 'JPY', symbol: '¥' },
          { name: 'British Pound Sterling', code: 'GBP', symbol: '£' },
          { name: 'Swiss Franc', code: 'CHF', symbol: 'CHF' },
          { name: 'Canadian Dollar', code: 'CAD', symbol: 'CA$' },
          { name: 'Australian Dollar', code: 'AUD', symbol: 'A$' },
          { name: 'Chinese Yuan (Renminbi)', code: 'CNY', symbol: '¥' },
          { name: 'Swedish Krona', code: 'SEK', symbol: 'kr' },
          { name: 'New Zealand Dollar', code: 'NZD', symbol: 'NZ$' },
          { name: 'South Korean Won', code: 'KRW', symbol: '₩' },
          { name: 'Singapore Dollar', code: 'SGD', symbol: 'S$' },
          { name: 'Hong Kong Dollar', code: 'HKD', symbol: 'HK$' },
          { name: 'Norwegian Krone', code: 'NOK', symbol: 'kr' },
          { name: 'Mexican Peso', code: 'MXN', symbol: 'Mex$' },
          { name: 'Indian Rupee', code: 'INR', symbol: '₹' },
          { name: 'Russian Ruble', code: 'RUB', symbol: '₽' },
          { name: 'Brazilian Real', code: 'BRL', symbol: 'R$' },
          { name: 'South African Rand', code: 'ZAR', symbol: 'R' },
          { name: 'Turkish Lira', code: 'TRY', symbol: '₺' },
          { name: 'UAE Dirham', code: 'AED', symbol: 'د.إ' },
          { name: 'Saudi Riyal', code: 'SAR', symbol: 'ر.س' },
          { name: 'Thai Baht', code: 'THB', symbol: '฿' },
          { name: 'Israeli New Shekel', code: 'ILS', symbol: '₪' },
          { name: 'Indonesian Rupiah', code: 'IDR', symbol: 'Rp' },
          { name: 'Malaysian Ringgit', code: 'MYR', symbol: 'RM' },
          { name: 'Philippine Peso', code: 'PHP', symbol: '₱' },
          { name: 'Pakistani Rupee', code: 'PKR', symbol: 'Rs' },
          { name: 'Argentine Peso', code: 'ARS', symbol: '$' },
          { name: 'Collombian Peso', code: 'COP', symbol: '$' },
          { name: 'Chilean Peso', code: 'CLP', symbol: '$' },
          { name: 'Ukrainian Hryvnia', code: 'UAH', symbol: '₴' },
          { name: 'Vietnamese Dong', code: 'VND', symbol: '₫' },
          { name: 'Bangladeshi Taka', code: 'BDT', symbol: '৳' },
          { name: 'Peruvian Sol', code: 'PEN', symbol: 'S/.' },
          { name: 'Kuwaiti Dinar', code: 'KWD', symbol: 'د.ك' },
          { name: 'Qatar Riyal', code: 'QAR', symbol: 'ر.ق' },
          { name: 'Omani Rial', code: 'OMR', symbol: 'ر.ع.' },
          { name: 'Jordanian Dinar', code: 'JOD', symbol: 'د.ا' },
          { name: 'Bahraini Dinar', code: 'BHD', symbol: 'د.ب' },
          { name: 'Icelandic Krona', code: 'ISK', symbol: 'kr' },
          { name: 'Iraqi Dinar', code: 'IQD', symbol: 'د.ع' },
          { name: 'Lebanese Pound', code: 'LBP', symbol: 'ل.ل' },
          { name: 'Sri Lankan Rupee', code: 'LKR', symbol: 'Rs' },
          { name: 'Georgian Lari', code: 'GEL', symbol: '₾' },
          { name: 'Costa Rican Colon', code: 'CRC', symbol: '₡' },
          { name: 'Croatian Kuna', code: 'HRK', symbol: 'kn' },
          { name: 'Bulgarian Lev', code: 'BGN', symbol: 'лв' },
          { name: 'Romanian Leu', code: 'RON', symbol: 'lei' },
          { name: 'Czech Koruna', code: 'CZK', symbol: 'Kč' },
          { name: 'Danish Krone', code: 'DKK', symbol: 'kr' },
          { name: 'Hungarian Forint', code: 'HUF', symbol: 'Ft' },
          { name: 'Polish Zloty', code: 'PLN', symbol: 'zł' },
        ],
        skipDuplicates: true,
      });

      /** Seeding animal types */
      await prisma.animalType.createMany({
        data: [
          {
            name: 'Poulet de chair',
            slug: 'poulets de chair',
            tab: 'aves-locations',
            habitat: 'poulaillé',
            photo:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/shutterstock_95209237-768x512.jpg20241024-C93N.jpeg',
            description:
              'Elever des poulets de chair  de zero jour à 31jours pour leur viande',
          },
          {
            name: 'Pondeuses',
            slug: 'pondeuses',
            tab: 'aves-locations',
            photo:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/laying-hens-4133954_640.jpg20241024-e0QI.jpeg',
            habitat: 'poulaillé',
            description:
              'Ici vous pouvez élever des poussins jusqua la phase de ponte pour les oeufs et puis les reformer pour la viande',
          },
          {
            name: 'Bovins',
            slug: 'boeufs',
            tab: 'locations',
            habitat: 'etables',
            photo:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/cow-3383624_640.jpg20241024-tzfZ.jpeg',
            description:
              'Une section pour élever des boeufs pour la production laitière et leur viande',
          },
          {
            name: 'Ovins',
            slug: 'moutons',
            habitat: 'enclos',
            tab: 'locations',
            photo:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/sheeps-6828766_640.jpg20241024-bfX0.jpeg',
            description: 'Elever des moutons pour leur viande ou leur laine',
          },
          {
            name: 'Caprins',
            slug: 'chèvres',
            habitat: 'enclos',
            tab: 'locations',
            photo:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/csm_ziegen_prospecierara_0f7b1f0deb.jpg20241024-96ny.jpeg',
            description: 'Elever des chèvres pour leurs viande ou du lait',
          },
          {
            name: 'Porciculture',
            slug: 'porcs',
            tab: 'locations',
            habitat: 'loges',
            photo:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/breeding-3739223_640.jpg20241024-3lEB.jpeg',
            description:
              'Elever des porcs pour leur viande qui passe bien sur le marché sans hésiter de varier les races pour maximer votre profit',
          },
          {
            name: 'Cuniculture',
            slug: 'lapins',
            tab: 'locations',
            habitat: 'clapiers',
            photo:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/rabbits-6889130_640.jpg20241024-0Qme.jpeg',
            description:
              'Elever des lapins pour leur prolificité, leur viande succulente faible en matière grasse et très bonne pour la santé',
          },
          {
            name: 'Quails',
            slug: 'quails',
            habitat: 'cages',
            tab: 'aves-locations',
            photo:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/pexels-brett-sayles-1309236.jpg20241024-jMYC.jpeg',
            description:
              'Elever des quails pour les viande et leur oeufs faible en matière grasse et verture médicinale',
          },
          {
            name: 'Canard',
            slug: 'canards',
            tab: 'aves-locations',
            habitat: 'canardière',
            photo:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/pekin_ducks_cropped.jpg20241024-3Ui6.jpeg',
            description:
              'Elever des canards pour leur rusticité, la vente de leur bonne viande blanche très faible en matière grasse et riche en proteins, leur oeufs fécondés et leur cannetons',
          },
          {
            name: 'Pisciculture',
            slug: 'poissons',
            habitat: 'étangs',
            tab: 'aves-locations',
            photo:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/trout-4725772_640.jpg20241024-fRB1.jpeg',
            description:
              'Elever des poissons pour la consomation domestique ou la vente',
          },
          {
            name: 'Dinde',
            slug: 'dindons',
            tab: 'aves-locations',
            habitat: 'poulaillé',
            photo:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/turkey-3455659_640.jpg20241024-sm7X.jpeg',
            description:
              'Elever des dindons pour leur gabarit, la vente de leur bonne viande blanche très faible en matière grasse et riche en proteins, leur oeufs fécondés et leur poussins',
          },
          {
            name: 'Pintarde',
            slug: 'pintardes',
            tab: 'aves-locations',
            habitat: 'poullaillé',
            photo:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/birds-7045998_640.jpg20241024-EeKf.jpeg',
            description:
              'Elever des pintarde pour leur rusticité et la vente de leur bonne viande blanche très faible en matière grasse, riche en proteins',
          },
          {
            name: 'Poulets Brahma',
            slug: 'poulets brahma',
            tab: 'aves-locations',
            habitat: 'poullaillé',
            photo:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/hen-brahma-4046755_640.jpg20241024-pc09.jpeg',
            description:
              'Elever des poulets brahmas pour leur rusticité, la vente de leur bonne viande blanche très faible en matière grasse et riche en proteins, leur oeufs fécondés et leur poussins',
          },
          {
            name: 'Poulets Goliaths',
            slug: 'poulets goliath',
            habitat: 'poullaillé',
            tab: 'aves-locations',
            photo:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/1599px-des_poulets_goliath_de_couleur_beige_dans_un_poulailler_au_benin.jpg20241024-Zlci.jpeg',
            description:
              'Elever des pintarde pour leur rusticité et la vente de leur bonne viande blanche très faible en matière grasse, riche en proteins',
          },
        ],
        skipDuplicates: true,
      });

      await prisma.material.createMany({
        data: [
          {
            name: 'Ventilation & temperature',
            type: 'LOCATION',
            image:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/ventilation-elevage.jpeg20241115-Gec8.jpeg',
          },
          {
            name: 'Canalisation & gestion des dejections',
            type: 'LOCATION',
            image:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/canalisation.jpeg20241115-Hzq8.jpeg',
          },
          {
            name: 'Litière & confort',
            type: 'LOCATION',
            image:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/litiere.jpeg20241115-R390.jpeg',
          },
          {
            name: 'Éclairage naturel & artificiel',
            type: 'LOCATION',
            image:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/eclairage.png20241115-CK5c.png',
          },
          {
            name: 'Orientation, taille & emplacement',
            type: 'LOCATION',
            image:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/orientation.jpeg20241115-FZm1.jpeg',
          },
          {
            name: 'Isolation',
            type: 'LOCATION',
            image:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/isolation.jpeg20241115-4dk6.jpeg',
          },
          {
            name: 'Sécurité et Surveillance',
            type: 'LOCATION',
            image:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/security.jpeg20241115-F1cb.jpeg',
          },
          {
            name: 'Isolation & protection contre vecteurs',
            type: 'LOCATION',
            image:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/isolation.jpeg20241115-4dk6.jpeg',
          },
          {
            name: 'Dorseuse et balance',
            type: 'TOOL',
            image:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/doseuse.jpeg20241114-a0gt.jpeg',
          },
          {
            name: 'Pulvérisateurs et nébulisateurs',
            type: 'TOOL',
            image:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/download.jpeg20241114-04PM.jpeg',
          },
          {
            name: 'Pelles, râteaux et balais',
            type: 'TOOL',
            image:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/tools.jpeg20241114-w07j.jpeg',
          },
          {
            name: 'Échographes',
            type: 'TOOL',
            image:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/echographe.jpeg20241114-v1eI.jpeg',
          },
          {
            name: 'Casiers et plateaux à œufs',
            type: 'TOOL',
            image:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/casiers-a-oeufs.jpeg20241114-feSx.jpeg',
          },
          {
            name: 'Lampe de mirage',
            type: 'TOOL',
            image:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/lampe-de-mirage.jpeg20241114-RSP2.jpeg',
          },
          {
            name: 'Anneaux ou étiquettes d’identification',
            type: 'TOOL',
            image:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/images.jpeg20241114-gicX.jpeg',
          },
          {
            name: 'Radiant & thermostat',
            type: 'TOOL',
            image:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/radiant.jpeg20241114-TRRQ.jpeg',
          },
          {
            name: 'Forage',
            type: 'TOOL',
            image:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/forage.jpeg20241114-uPcm.jpeg',
          },
          {
            name: 'Mangeoires et abreuvoirs',
            type: 'TOOL',
            image:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/mangeaors.jpeg20241114-kxec.jpeg',
          },
          {
            name: 'Kit de nettoyage',
            type: 'TOOL',
            image:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/kit-de-nettoyage.jpeg20241115-RRsr.jpeg',
          },
          {
            name: 'Combinaison de travail',
            type: 'TOOL',
            image:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/combinaison.jpeg20241114-8e6I.jpeg',
          },
          {
            name: 'Produits de nettoyage et désinfection',
            type: 'TOOL',
            image:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/desinfection.jpeg20241114-cNrK.jpeg',
          },
          {
            name: 'Incubateur',
            type: 'TOOL',
            image:
              'https://diasmalia-buck.s3.eu-central-1.amazonaws.com/photos/incubateur-%281%29.jpeg20241114-3jY2.jpeg',
          },
        ],
      });

      console.log(`${environment} database seeded successfully`);
      break;
    case 'test':
      /** data for your test environment */
      break;
    default:
      break;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
