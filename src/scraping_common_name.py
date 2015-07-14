from bs4 import BeautifulSoup
import requests
import psycopg2


# Obtain scientific names from db
con = psycopg2.connect(database='nature', user='')
cur = con.cursor()
cur.execute('select scientific_name from nature_dex_specimen')
rows = cur.fetchall()

# Counters
tot_counter = 0
not_found_wm_counter = 0
found_wm_counter = 0
not_found_wp_counter = 0
found_wp_counter = 0
found_counter = 0

for row in rows:
    specie = row[0]
# for row in rows[:1]:
#     specie = "Linaria benitoi"
    tot_counter += 1
    print("=====================")
    print(specie)

    # Get common spanish name at Wikimedia Species
    url = "https://species.wikimedia.org/wiki/" + specie
    page = requests.get(url, allow_redirects=True)
    soup = BeautifulSoup(page.text, "html.parser")
    res = soup.find("b", text="español:")
    spanish_wm_name = ""

    if res:
        spanish_wm_name = res.next_sibling
    # else:
    #     res = soup.find("b", text="English:")
    #     # Trying to translate the common english name from Wikimedia
    #     if res:
    #         english_name = res.next_sibling
    #         url = "https://translate.google.com/translate_a/single?client=t&sl=en&tl=es&dt=t&dt=at&ie=UTF-8&q="+english_name
    #         page = requests.get(url, allow_redirects=False)
    #         spanish_wm_name = str(page.content).split('"')[1]

        print("=> " + spanish_wm_name.strip().capitalize())
        found_wm_counter += 1
        found_counter += 1

    else:
        # Get common spanish name at Wikipedia
        not_found_wm_counter += 1
        spanish_wp_name = ""

        url = "https://es.wikipedia.org/wiki/" + specie
        page = requests.get(url, allow_redirects=True)
        soup = BeautifulSoup(page.text, "html.parser")
        res = soup.body.p.b
        res = soup.select("#mw-content-text")[0].children

        i = 0
        for child in res:
            # print(str(i))
            # print(str(child))
            if (i == 2 or i == 4) and child.name != "table" and not spanish_wp_name :
                if "Wikipedia aún no tiene una página" not in str(soup.findAll("b")[0]):
                    dirty_spanish_wp_name = str(child.findAll("b")).capitalize().replace(specie.lower(),'')
                    # print("=="+dirty_spanish_wp_name)
                    spanish_wp_name = dirty_spanish_wp_name.replace('b>','').translate(str.maketrans('','','[</>]'))
            i += 1

        # "Not found" redirect at wikipedia. Example url: https://goo.gl/iF0pmo
        if not res and "no tiene una página llamada" not in str(soup.findAll("b")[0]):
            # sometimes this other scrapping returns the valid common name from the top square of the web
            res = list(soup.find("th", { "class" : "cabecera" }).children)[-1]
            if res:
                print("econtrado!!!!")
                spanish_wp_name = res.string

        if not spanish_wp_name:
            print("No existen resultados")
            not_found_wp_counter += 1
        else:
            print("=> " + spanish_wp_name.strip().capitalize())
            found_wp_counter += 1
            if not spanish_wm_name:
                found_counter += 1

    print('Found: ' + str(found_counter) + ' of ' + str(tot_counter))

print("=============================================")
print('Found at wikimedia: ' + str(found_wm_counter) + ' / Not found: ' + str(not_found_wm_counter))
print('Found at wikipedia: ' + str(found_wp_counter) + ' / Not found: ' + str(not_found_wp_counter))



# Obtain common names method from scientific names
# http://metodosdebusca.es/buscar-traduccion-de-nombres-de-plantas-animales-y-otros-seres-vivos/

# Wikimedia / Wikipedia API
# https://es.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&format=jsonfm&titles=Rattus%20norvegicuse)
# https://www.mediawiki.org/wiki/API:Query#Sample_query

# BeautifulSoup Doc
# http://www.crummy.com/software/BeautifulSoup/bs4/doc/#going-down

# Controversial names for scrapping
# Upupa epops
# Anthus spinoletta
# Trachemys emolli
# Neovison vison
# Alytes obstetricans
# Lanius excubitor
# Anguilla anguilla
# Phoxinus phoxinus
# Nandayus nenday (OK 301)
# Mylabris nevadensis (Bad 301)
# Rana catesbeiana (BAD TRANSLATION)
# Acrocephalus melanopogon (UTF-8 problem)
# Oncorhynchus kisutch (Segundos resultados Wikipedia)

# Pipistrellus pipistrellus (P. pipistrellus, schreber, thomas, temminck)
# Falco_peregrinus (F. peregrinus)
# Anas crecca / Rattus norvegicus
# Linaria benitoi (Fail)
