import json
import requests

city_en = ['Alofi', 'Niue', 'Midway', 'United States Minor Outlying Islands', 'Pago Pago', 'American Samoa', 'Avarua', 'Cook Islands', 'Adak', 'United States', 'Honolulu', 'Faaa', 'French Polynesia', 'Marquesas', 'Anchorage', 'Gambier', 'Los Angeles', 'Tijuana', 'Mexico', 'Vancouver', 'Canada', 'Adamstown', 'Pitcairn', 'Hermosillo', 'Calgary', 'Ciudad Juárez', 'Denver', 'Phoenix', 'Whitehorse', 'Belize City', 'Belize', 'Chicago', 'Guatemala City', 'Guatemala', 'Managua', 'Nicaragua', 'Mexico City', 'San José', 'Costa Rica', 'San Salvador', 'El Salvador', 'Saskatoon', 'Tegucigalpa', 'Honduras', 'Winnipeg', 'Easter', 'Chile', 'Galapagos', 'Ecuador', 'Rio Branco', 'Brazil', 'Bogotá', 'Colombia', 'Havana', 'Cuba', 'Atikokan', 'Cancún', 'Cockburn Town', 'Turks and Caicos Islands', 'George Town', 'Cayman Islands', 'Kingston', 'Jamaica', 'Nassau', 'Bahamas', 'New York City', 'Panamá', 'Panama', 'Port-au-Prince', 'Haiti', 'Toronto', 'Guayaquil', 'Lima', 'Peru', 'Manaus', 'Basseterre', 'Saint Kitts and Nevis', 'Brades', 'Montserrat', 'Bridgetown', 'Barbados', 'Castries', 'Saint Lucia', 'Chaguanas', 'Trinidad and Tobago', 'Fort-de-France', 'Martinique', 'Gustavia', 'Saint Barthelemy', 'Halifax', 'Hamilton', 'Bermuda', 'Kingstown', 'Saint Vincent and the Grenadines', 'Kralendijk', 'Bonaire, Saint Eustatius and Saba ', 'Les Abymes', 'Guadeloupe', 'Lévis', 'Marigot', 'Saint Martin', 'Oranjestad', 'Aruba', 'Philipsburg', 'Sint Maarten', 'Road Town', 'British Virgin Islands', 'Roseau', 'Dominica', 'Saint Croix', 'U.S. Virgin Islands', "Saint George's", 'Grenada', 'Saint John’s', 'Antigua and Barbuda', 'San Juan', 'Puerto Rico', 'Santo Domingo', 'Dominican Republic', 'The Valley', 'Anguilla', 'Thule', 'Greenland', 'Willemstad', 'Curacao', 'Santa Cruz de la Sierra', 'Bolivia', 'Santiago', 'Georgetown', 'Guyana', 'Asunción', 'Paraguay', 'Caracas', 'Venezuela', "St. John's", 'Buenos Aires', 'Argentina', 'São Paulo', 'Palmer', 'Antarctica', 'Punta Arenas', 'Stanley', 'Falkland Islands', 'Cayenne', 'French Guiana', 'Saint-Pierre', 'Saint Pierre and Miquelon', 'Paramaribo', 'Suriname', 'Montevideo', 'Uruguay', 'Nuuk', 'Noronha', 'Grytviken', 'South Georgia and the South Sandwich Islands', 'Ponta Delgada', 'Portugal', 'Praia', 'Cabo Verde', 'Scoresbysund', 'Abidjan', 'Ivory Coast', 'Accra', 'Ghana', 'Bamako', 'Mali', 'Bissau', 'Guinea-Bissau', 'Camayenne', 'Guinea', 'Dakar', 'Senegal', 'Danmarkshavn', 'Douglas', 'Isle of Man', 'Dublin', 'Ireland', 'Freetown', 'Sierra Leone', 'Jamestown', 'Saint Helena', 'Lomé', 'Togo', 'London', 'United Kingdom', 'Monrovia', 'Liberia', 'Nouakchott', 'Mauritania', 'Ouagadougou', 'Burkina Faso', 'Reykjavík', 'Iceland', 'Saint Helier', 'Jersey', 'Saint Peter Port', 'Guernsey', 'Serekunda', 'Gambia', 'São Tomé', 'Sao Tome and Principe', 'Troll', 'Casablanca', 'Morocco', 'Laayoune', 'Western Sahara', 'Las Palmas de Gran Canaria', 'Spain', 'Lisbon', 'Tórshavn', 'Faroe Islands', 'Windhoek', 'Namibia', 'Algiers', 'Algeria', 'Amsterdam', 'Netherlands', 'Andorra la Vella', 'Andorra', 'Belgrade', 'Serbia', 'Berlin', 'Germany', 'Birkirkara', 'Malta', 'Bratislava', 'Slovakia', 'Brussels', 'Belgium', 'Budapest', 'Hungary', 'Copenhagen', 'Denmark', 'Gibraltar', 'Ljubljana', 'Slovenia', 'Longyearbyen', 'Svalbard and Jan Mayen', 'Luxembourg', 'Madrid', 'Monaco', 'Oslo', 'Norway', 'Paris', 'France', 'Podgorica', 'Montenegro', 'Prague', 'Czechia', 'Rome', 'Italy', 'San Marino', 'Sarajevo', 'Bosnia and Herzegovina', 'Skopje', 'North Macedonia', 'Stockholm', 'Sweden', 'Tirana', 'Albania', 'Tunis', 'Tunisia', 'Vaduz', 'Liechtenstein', 'Vatican City', 'Vatican', 'Vienna', 'Austria', 'Warsaw', 'Poland', 'Zagreb', 'Croatia', 'Zürich', 'Switzerland', 'Bangui', 'Central African Republic', 'Bata', 'Equatorial Guinea', 'Brazzaville', 'Republic of the Congo', 'Cotonou', 'Benin', 'Douala', 'Cameroon', 'Kinshasa', 'Democratic Republic of the Congo', 'Lagos', 'Nigeria', 'Libreville', 'Gabon', 'Luanda', 'Angola', "N'Djamena", 'Chad', 'Niamey', 'Niger', 'Bujumbura', 'Burundi', 'Gaborone', 'Botswana', 'Harare', 'Zimbabwe', 'Khartoum', 'Sudan', 'Kigali', 'Rwanda', 'Lilongwe', 'Malawi', 'Lubumbashi', 'Lusaka', 'Zambia', 'Maputo', 'Mozambique', 'Aleppo', 'Syria', 'Amman', 'Jordan', 'Athens', 'Greece', 'Beirut', 'Lebanon', 'Bucharest', 'Romania', 'Cairo', 'Egypt', 'Chisinau', 'Moldova', 'East Jerusalem', 'Palestinian Territory', 'Helsinki', 'Finland', 'Kaliningrad', 'Russia', 'Kyiv', 'Ukraine', 'Mariehamn', 'Aland Islands', 'Nicosia', 'Cyprus', 'Riga', 'Latvia', 'Sofia', 'Bulgaria', 'Tallinn', 'Estonia', 'Tripoli', 'Libya', 'Vilnius', 'Lithuania', 'Jerusalem', 'Israel', 'Cape Town', 'South Africa', 'Manzini', 'Eswatini', 'Maseru', 'Lesotho', 'Al Aḩmadī', 'Kuwait', 'Baghdad', 'Iraq', 'Doha', 'Qatar', 'Manama', 'Bahrain', 'Riyadh', 'Saudi Arabia', 'Sanaa', 'Yemen', 'Addis Ababa', 'Ethiopia', 'Antananarivo', 'Madagascar', 'Asmara', 'Eritrea', 'Dar es Salaam', 'Tanzania', 'Djibouti', 'Juba', 'South Sudan', 'Kampala', 'Uganda', 'Mamoudzou', 'Mayotte', 'Mogadishu', 'Somalia', 'Moroni', 'Comoros', 'Nairobi', 'Kenya', 'Minsk', 'Belarus', 'Moscow', 'Syowa', 'Istanbul', 'Turkey', 'Tehran', 'Iran', 'Yerevan', 'Armenia', 'Baku', 'Azerbaijan', 'Tbilisi', 'Georgia', 'Dubai', 'United Arab Emirates', 'Muscat', 'Oman', 'Port Louis', 'Mauritius', 'Saint-Denis', 'Reunion', 'Samara', 'Victoria', 'Seychelles', 'Kabul', 'Afghanistan', 'Port-aux-Français', 'French Southern Territories', 'Male', 'Maldives', 'Mawson', 'Karachi', 'Pakistan', 'Dushanbe', 'Tajikistan', 'Ashgabat', 'Turkmenistan', 'Tashkent', 'Uzbekistan', 'Kyzylorda', 'Kazakhstan', 'Yekaterinburg', 'Colombo', 'Sri Lanka', 'Mumbai', 'India', 'Kathmandu', 'Nepal', 'Dhaka', 'Bangladesh', 'Thimphu', 'Bhutan', 'Zhongshan', 'China', 'Almaty', 'Chagos', 'British Indian Ocean Territory', 'Bishkek', 'Kyrgyzstan', 'Omsk', 'Vostok', 'West Island', 'Cocos Islands', 'Yangon', 'Myanmar', 'Flying Fish Cove', 'Christmas Island', 'Davis', 'Khovd', 'Mongolia', 'Bangkok', 'Thailand', 'Ho Chi Minh City', 'Vietnam', 'Phnom Penh', 'Cambodia', 'Vientiane', 'Laos', 'Novosibirsk', 'Jakarta', 'Indonesia', 'Perth', 'Australia', 'Bandar Seri Begawan', 'Brunei', 'Makassar', 'Macau', 'Macao', 'Shanghai', 'Hong Kong', 'Irkutsk', 'Kota Bharu', 'Malaysia', 'Quezon City', 'Philippines', 'Singapore', 'Taipei', 'Taiwan', 'Ulan Bator', 'Eucla', 'Dili', 'Timor Leste', 'Ambon', 'Tokyo', 'Japan', 'Pyongyang', 'North Korea', 'Seoul', 'South Korea', 'Ngerulmud', 'Palau', 'Chita', 'Adelaide', 'Darwin', 'Brisbane', 'Sydney', 'Dededo Village', 'Guam', 'Saipan', 'Northern Mariana Islands', 'Chuuk', 'Micronesia', 'DumontDUrville', 'Port Moresby', 'Papua New Guinea', 'Vladivostok', 'Lord Howe', 'Arawa', 'Casey', 'Kosrae', 'Nouméa', 'New Caledonia', 'Norfolk Island', 'Yuzhno-Sakhalinsk', 'Honiara', 'Solomon Islands', 'Port-Vila', 'Vanuatu', 'Suva', 'Fiji', 'Tarawa', 'Kiribati', 'Majuro', 'Marshall Islands', 'Yaren', 'Nauru', 'Auckland', 'New Zealand', 'McMurdo', 'Petropavlovsk-Kamchatsky', 'Funafuti', 'Tuvalu', 'Wake', 'Mata-Utu', 'Wallis and Futuna', 'Chatham', 'Apia', 'Samoa', 'Enderbury', 'Fakaofo', 'Tokelau', 'Nuku‘alofa', 'Tonga', 'Kiritimati']

city_en = ['匈牙利语', '希腊语', '捷克语', '保加利亚语', '瑞典语']

host = 'https://api-free.deepl.com/v2/translate'
API_KEY = 'a9ce0017-07a3-b88c-9890-0749f0f60250:fx'

city_jp = {}

def translate_word(src_words):
    post_data = [
        ('auth_key', API_KEY),
        ('source_lang', 'ZH'),
        ('target_lang', 'JA')
    ]
    for word in src_words:
        post_data.append(('text', word))
    resp = requests.post(url=host, params=post_data)
    translated_json = resp.json()
    results = []
    for i in range(len(src_words)):
        translated = translated_json['translations'][i]['text']
        results.append(translated)
        city_jp[src_words[i]] = translated
    return results

batch_amount = 1

for i in range(batch_amount, len(city_en), batch_amount):
    jps = translate_word(city_en[i-batch_amount:i])
    print(f'translated word {i} / {len(city_en)}', end='\r')

json_result = json.dumps(city_jp, ensure_ascii = False)

with open('jp_results.json', 'w+', encoding='utf8') as fp:
    json.dump(city_jp, fp, ensure_ascii=False)

print(json_result)
# result = translate_word('Vienna')
# print(result)