(function(window, document, $) {

  var priv = {};

  /* ====================================================================== */
  /*                          Fragment Cache                                */
  /* ====================================================================== */
  // For performance reasons contents can share display elements, like for
  // popups, which are costly to generate. The popup will stay on the page
  // while the content is generated, cached here and swapped when displayed.
  // TODO: Fragment Cache should be a gadget?
  priv.fragment_cache = {};

  /* ====================================================================== */
  /*                          Global Page Configuration                     */
  /* ====================================================================== */
  // Each page should be a gadget(?). All global elements (header, footer)
  // should be configured depending on page loaded, for example page "foo"
  // should switch the global header to displaying "Foo". The configuration
  // of all pages can be found below:
  // NOTE: available states = default|hint|hide|active
  // NOTE: we only update the class of the element. When clicked we can
  // check for the current state and corresponding link to follow
  priv.page_setup = {
    "dashboard": {
      "title": "Dashboard",
      "title_i18n": ""
    },
    "simulation": {
      "title": "Simulation",
      "title_i18n": ""
    },
    "invoices": {
      "title": "Invoices",
      "title_i18n": ""
    },
    "servers": {
      "title": "Servers",
      "title_i18n": ""
    },
    "services": {
      "title": "Services",
      "title_i18n": ""
    },
    "networks": {
      "title": "Networks",
      "title_i18n": ""
    },
    "monitoring": {
      "title": "Monitoring",
      "title_i18n": ""
    },
    "help": {
      "title": "Help",
      "title_i18n": ""
    },
    "software": {
      "title": "Software",
      "title_i18n": ""
    },
    "wiki": {
      "title": "Documentation",
      "title_i18n": ""
    },
    "download": {
      "title": "Download",
      "title_i18n": ""
    },
    "formum": {
      "title": "Forum",
      "title_i18n": ""
    },
    "blog": {
      "title": "Blog",
      "title_i18n": ""
    },
    "pricing": {
      "title": "Pricing",
      "title_i18n": ""
    }
  };
  /* ====================================================================== */
  /*                          Fake Records                                  */
  /* ====================================================================== */
  // NOTE: since we don't have access to EPR5 or JIO, these are fake JIO
  // responses
  priv.getFakeRecords = {
    "services": [
      {
        "_id": 1,
        "doc": {
          // listbox image...
          "image": {
            "href": "https://www.slapos.org/software_product_module/2/default_image/index_html?quality=75&display=thumbnail"
          },
          "my_title": "instance_1234556666"
        }
      }
    ],
    "computer": [
      {
        "_id": 1,
        "doc": {
          "status": {"state":"error", "message": "No data found for COMP-1781", "message_i18n":"", "error_i18n":""},
          "_id": 1, 
          "my_title": "Sample_001",
          "my_reference": "COMP-1781",
          "my_translated_validation_state_title": "personal"
        }
      }, {
        "_id": 2,
        "doc": {
          "status": {"state":"error", "message": "No data found for COMP-1796", "message_i18n":"", "error_i18n":""},
          "_id": 2,
          "my_title": "f",
          "my_reference": "COMP-1796",
          "my_translated_validation_state_title": "personal"
        }
      }
    ],
    "invoices": [
      {
        "_id": 1,
        "doc": {
          "_id": 1,
          "my_invoice_date": "2013/02/07",
          "my_price_currency": "EUR",
          "my_total_price": "1,0",
          "my_translated_simulation_state_title": "Paid",
          "navigate": [],
          "action": [],
          "export": {
            "type": "controlgroup",
            "direction": "horizontal",
            "class": "",
            "controls_class": "",
            "buttons": [{
              "type": "a",
              "direct": {
                "href": "",
                "className": "responsive translate action_export ui-link ui-btn ui-shadow ui-corner-all ui-icon-file ui-btn-icon-left ui-first-child ui-last-child"
              },
              "attributes": {
                "data-role":"button",
                "data-type":"download",
                "data-format":"pdf",
                "data-icon":"file",
                "data-i18n":"",
                "data-iconpos":"left"
              },
              "logic": {"text": "Download"}
            }]
          }
        }
      }, {
        "_id": 2,
        "doc": {
          "my_invoice_date": "2013/02/11",
          "my_price_currency": "EUR",
          "my_total_price": "-1,0",
          "my_translated_simulation_state_title": "Paid",
          "navigate": [],
          "action": [],
          "export": {
            "type": "controlgroup",
            "direction": "horizontal",
            "class": "",
            "controls_class": "",
            "buttons": [{
              "type": "a",
              "direct": {
                "href": "",
                "className": "responsive translate action_export ui-link ui-btn ui-shadow ui-corner-all ui-icon-file ui-btn-icon-left ui-first-child ui-last-child"
              },
              "attributes": {
                "data-role":"button",
                "data-type":"download",
                "data-format":"pdf",
                "data-icon":"file",
                "data-i18n":"",
                "data-iconpos":"left"
              },
              "logic": {"text": "Download"}
            }]
          }
        }
      }
    ],
    "networks": [
      {
        "_id":1,
        "doc": {
          "_id": 1,
          "my_title": "foonet",
          "my_reference": "NET-53"
        }
      }
    ]
  };

  /* ====================================================================== */
  /*                          Select Options                                */
  /* ====================================================================== */
  // These are the options needed for select fields. Since we cannot pull
  // them from JIO currently, everything hardcoded here...
  // TODO: Fetch via JSON
  priv.get_hardcoded_values = {
    "getCurrencies": [
      {"text": "", "i18n": "", "value": ""},
      {"text": "EUR", "i18n": "", "value": "eur"},
      {"text": "USD", "i18n": "", "value": "usd"}
    ],
    "getComputerGroups": [
      {"text": "", "i18n":"", "value":""},
      {"text": "Amazon.Group", "i18n":"", "value": "amazon"},
      {"text": "Atlantic.net Group", "i18n":"", "value":"atlanticnet"},
      {"text": "Bull Group", "i18n":"", "value":"bull"},
      {"text": "Slapos Company", "i18n":"", "value":"company"},
      {"text": "Gandi Group", "i18n":"", "value":"gandi"},
      {"text": "IBM Group", "i18n":"", "value":"ibm"},
      {"text": "Joyent Group", "i18n":"", "value":"joyent"},
      {"text": "OVH Group", "i18n":"", "value":"ovh"},
      {"text": "Microsoft Group", "i18n":"", "value":"microsoft"},
      {"text": "Rackspace Group", "i18n":"", "value":"rackspace"},
      {"text": "VIFIB Group", "i18n":"", "value":"vifib"},
      {"text": "wmWare Group", "i18n":"", "value":"vmware"}
    ],
    "getComputerCPUCore": [
      {"text": "", "i18n":"", "class":"translate", "value":""},
    ],
    "getComputerCPUFrequency": [
      {"text": "", "i18n":"", "class":"translate", "value":""},
      {"text": "1000 MHz", "i18n":"", "class":"translate", "value":"1000"},
      {"text": "1100 MHz", "i18n":"", "class":"translate", "value":"1100"},
      {"text": "1200 MHz", "i18n":"", "class":"translate", "value":"1200"},
      {"text": "1300 MHz", "i18n":"", "class":"translate", "value":"1300"},
      {"text": "1400 MHz", "i18n":"", "class":"translate", "value":"1400"},
      {"text": "1500 MHz", "i18n":"", "class":"translate", "value":"1500"},
      {"text": "1600 MHz", "i18n":"", "class":"translate", "value":"1600"},
      {"text": "1700 MHz", "i18n":"", "class":"translate", "value":"1700"},
      {"text": "1800 MHz", "i18n":"", "class":"translate", "value":"1800"},
      {"text": "1900 MHz", "i18n":"", "class":"translate", "value":"1900"},
      {"text": "2000 MHz", "i18n":"", "class":"translate", "value":"2000"},
      {"text": "2100 MHz", "i18n":"", "class":"translate", "value":"2100"},
      {"text": "2200 MHz", "i18n":"", "class":"translate", "value":"2200"},
      {"text": "2300 MHz", "i18n":"", "class":"translate", "value":"2300"},
      {"text": "2400 MHz", "i18n":"", "class":"translate", "value":"2400"},
      {"text": "2500 MHz", "i18n":"", "class":"translate", "value":"2500"},
      {"text": "2600 MHz", "i18n":"", "class":"translate", "value":"2600"},
      {"text": "2700 MHz", "i18n":"", "class":"translate", "value":"2700"},
      {"text": "2800 MHz", "i18n":"", "class":"translate", "value":"2800"},
      {"text": "2900 MHz", "i18n":"", "class":"translate", "value":"2900"},
      {"text": "3000 MHz", "i18n":"", "class":"translate", "value":"3000"},
      {"text": "3100 MHz", "i18n":"", "class":"translate", "value":"3100"},
      {"text": "3200 MHz", "i18n":"", "class":"translate", "value":"3200"},
      {"text": "3300 MHz", "i18n":"", "class":"translate", "value":"3300"},
      {"text": "3400 MHz", "i18n":"", "class":"translate", "value":"3400"},
      {"text": "600 MHz", "i18n":"", "class":"translate", "value":"600"},
      {"text": "700 MHz", "i18n":"", "class":"translate", "value":"700"},
      {"text": "800 MHz", "i18n":"", "class":"translate", "value":"800"},
      {"text": "900 MHz", "i18n":"", "class":"translate", "value":"900"},
    ],
    "getComputerCPUType": [
      {"text": "", "i18n":"", "class":"translate", "value":""},
      {"text": "ARM", "i18n":"", "class":"translate", "value":"arm"},
      {"text": "ARM/ARM11", "i18n":"", "class":"translate", "value":"arm/arm11"},
      {"text": "ARM/ARM7", "i18n":"", "class":"translate", "value":"arm/arm7"},
      {"text": "ARM/ARM9", "i18n":"", "class":"translate", "value":"arm/arm9"},
      {"text": "Intel x86", "i18n":"", "class":"translate", "value":"x86"},
      {"text": "Intel x86/Intel x86 32 bit", "i18n":"", "class":"translate", "value":"x86/x86_32"},
      {"text": "Intel x86/Intel x86 32 bit/Intel 486", "i18n":"", "class":"translate", "value":"x86/x86_32/i486"},
      {"text": "Intel x86/Intel x86 32 bit/Intel Core", "i18n":"", "class":"translate", "value":"x86/x86_32/core"},
      {"text": "Intel x86/Intel x86 32 bit/Intel Pentium", "i18n":"", "class":"translate", "value":"x86/x86_32/i586"},
      {"text": "Intel x86/Intel x86 32 bit/Intel Pentium Pro", "i18n":"", "class":"translate", "value":"x86/x86_32/i686"},
      {"text": "Intel x86/Intel x86 64 bit", "i18n":"", "class":"translate", "value":"x86/x86_64"},
      {"text": "Intel x86/Intel x86 64 bit/Intel Nehalem Architecture", "i18n":"", "class":"translate", "value":"x86/x86_64/nehalem"},
      {"text": "Intel x86/Intel x86 64 bit/Intel Sandy Bridge Architecture", "i18n":"", "class":"translate", "value":"x86/x86_64/sandybridge"},
    ],
    "getComputerLANType": [
      {"text": "", "i18n":"", "class":"translate", "value":""},
      {"text": "Ethernet", "i18n":"", "class":"translate", "value":"ethernet"},
      {"text": "Ethernet/1 Gbps Ethernet", "i18n":"", "class":"translate", "value":"ethernet/1g"},
      {"text": "Ethernet/10 Gbps Ethernet", "i18n":"", "class":"translate", "value":"ethernet/10g"},
      {"text": "Ethernet/10 Mbps Ethernet", "i18n":"", "class":"translate", "value":"ethernet/10m"},
      {"text": "Ethernet/100 Gbps Ethernet", "i18n":"", "class":"translate", "value":"ethernet/100g"},
      {"text": "Ethernet/100 Mbps Ethernet", "i18n":"", "class":"translate", "value":"ethernet/100m"},
      {"text": "Ethernet/40 Gbps Ethernet", "i18n":"", "class":"translate", "value":"ethernet/40g"},
      {"text": "Infiniband", "i18n":"", "class":"translate", "value":"infiniband"},
      {"text": "Wifi 802.11", "i18n":"", "class":"translate", "value":"wifi"},
      {"text": "Wifi 802.11/801.11b Wifi", "i18n":"", "class":"translate", "value":"wifi/b"},
      {"text": "Wifi 802.11/802.11g Wifi", "i18n":"", "class":"translate", "value":"wifi/g"},
      {"text": "Wifi 802.11/802.11n Wifi", "i18n":"", "class":"translate", "value":"wifi/n"},
    ],
    "getComputerMemorySize": [
      {"text": "", "i18n":"", "class":"translate", "value":""},
      {"text": "1 GB RAM", "i18n":"", "class":"translate", "value":"1"},
      {"text": "12 GB RAM", "i18n":"", "class":"translate", "value":"12"},
      {"text": "128 GB RAM", "i18n":"", "class":"translate", "value":"128"},
      {"text": "16 GB RAM", "i18n":"", "class":"translate", "value":"16"},
      {"text": "196 GB RAM", "i18n":"", "class":"translate", "value":"196"},
      {"text": "2 GB RAM", "i18n":"", "class":"translate", "value":"2"},
      {"text": "24 GB RAM", "i18n":"", "class":"translate", "value":"24"},
      {"text": "256 GB RAM", "i18n":"", "class":"translate", "value":"256"},
      {"text": "32 GB RAM", "i18n":"", "class":"translate", "value":"32"},
      {"text": "4 GB RAM", "i18n":"", "class":"translate", "value":"4"},
      {"text": "48 GB RAM", "i18n":"", "class":"translate", "value":"48"},
      {"text": "64 GB RAM", "i18n":"", "class":"translate", "value":"64"},
      {"text": "8 GB RAM", "i18n":"", "class":"translate", "value":"8"},
      {"text": "96 GB RAM", "i18n":"", "class":"translate", "value":"96"},
    ],
    "getComputerMemoryType": [
      {"text": "", "i18n":"", "class":"translate", "value":""},
      {"text": "DDR2 Memory", "i18n":"", "class":"translate", "value":"ddr2"},
      {"text": "DDR2 Memory/1066 Mhz", "i18n":"", "class":"translate", "value":"ddr2/1066"},
      {"text": "DDR2 Memory/400 Mhz", "i18n":"", "class":"translate", "value":"ddr2/400"},
      {"text": "DDR2 Memory/533 Mhz", "i18n":"", "class":"translate", "value":"ddr2/533"},
      {"text": "DDR2 Memory/667 Mhz", "i18n":"", "class":"translate", "value":"ddr2/667"},
      {"text": "DDR2 Memory/800 Mhz", "i18n":"", "class":"translate", "value":"ddr2/800"},
      {"text": "DDR3 Memory", "i18n":"", "class":"translate", "value":"ddr3"},
      {"text": "DDR3 Memory/1066 Mhz", "i18n":"", "class":"translate", "value":"ddr3/1066"},
      {"text": "DDR3 Memory/1333 Mhz", "i18n":"", "class":"translate", "value":"ddr3/1333"},
      {"text": "DDR3 Memory/1600 Mhz", "i18n":"", "class":"translate", "value":"ddr3/1600"},
      {"text": "DDR3 Memory/1866 Mhz", "i18n":"", "class":"translate", "value":"ddr3/1866"},
      {"text": "DDR3 Memory/2133 Mhz", "i18n":"", "class":"translate", "value":"ddr3/2133"},
      {"text": "DDR3 Memory/800 Mhz", "i18n":"", "class":"translate", "value":"ddr3/800"},
    ],
    "getComputerRegion": [
      {"text": "", "i18n":"", "class":"translate", "value":""},
      {"text": "Africa", "i18n":"", "class":"translate", "value":"africa"},
      {"text": "Africa/Eastern Africa", "i18n":"", "class":"translate", "value":"africa/east"},
      {"text": "Africa/Eastern Africa/Burundi", "i18n":"", "class":"translate", "value":"africa/east/108"},
      {"text": "Africa/Eastern Africa/Comoros", "i18n":"", "class":"translate", "value":"africa/east/174"},
      {"text": "Africa/Eastern Africa/Djibouti", "i18n":"", "class":"translate", "value":"africa/east/262"},
      {"text": "Africa/Eastern Africa/Eritrea", "i18n":"", "class":"translate", "value":"africa/east/232"},
      {"text": "Africa/Eastern Africa/Ethiopia", "i18n":"", "class":"translate", "value":"africa/east/ethiopia"},
      {"text": "Africa/Eastern Africa/Kenya", "i18n":"", "class":"translate", "value":"africa/east/404"},
      {"text": "Africa/Eastern Africa/Madagascar", "i18n":"", "class":"translate", "value":"africa/east/450"},
      {"text": "Africa/Eastern Africa/Malawi", "i18n":"", "class":"translate", "value":"africa/east/454"},
      {"text": "Africa/Eastern Africa/Mauritius", "i18n":"", "class":"translate", "value":"africa/east/480"},
      {"text": "Africa/Eastern Africa/Mayotte", "i18n":"", "class":"translate", "value":"africa/east/175"},
      {"text": "Africa/Eastern Africa/Mozambique", "i18n":"", "class":"translate", "value":"africa/east/508"},
      {"text": "Africa/Eastern Africa/Rwanda", "i18n":"", "class":"translate", "value":"africa/east/646"},
      {"text": "Africa/Eastern Africa/Réunion", "i18n":"", "class":"translate", "value":"africa/east/638"},
      {"text": "Africa/Eastern Africa/Seychelles", "i18n":"", "class":"translate", "value":"africa/east/690"},
      {"text": "Africa/Eastern Africa/Somalia", "i18n":"", "class":"translate", "value":"africa/east/706"},
      {"text": "Africa/Eastern Africa/Uganda", "i18n":"", "class":"translate", "value":"africa/east/800"},
      {"text": "Africa/Eastern Africa/United Republic of Tanzania", "i18n":"", "class":"translate", "value":"africa/east/834"},
      {"text": "Africa/Eastern Africa/Zambia", "i18n":"", "class":"translate", "value":"africa/east/894"},
      {"text": "Africa/Eastern Africa/Zimbabwe", "i18n":"", "class":"translate", "value":"africa/east/716"},
      {"text": "Africa/Middle Africa", "i18n":"", "class":"translate", "value":"africa/central"},
      {"text": "Africa/Middle Africa/Angola", "i18n":"", "class":"translate", "value":"africa/central/024"},
      {"text": "Africa/Middle Africa/Cameroon", "i18n":"", "class":"translate", "value":"africa/central/cameroun"},
      {"text": "Africa/Middle Africa/Central African Republic", "i18n":"", "class":"translate", "value":"africa/central/140"},
      {"text": "Africa/Middle Africa/Chad", "i18n":"", "class":"translate", "value":"africa/central/148"},
      {"text": "Africa/Middle Africa/Congo", "i18n":"", "class":"translate", "value":"africa/central/178"},
      {"text": "Africa/Middle Africa/Democratic Republic of the Congo", "i18n":"", "class":"translate", "value":"africa/central/180"},
      {"text": "Africa/Middle Africa/Equatorial Guinea", "i18n":"", "class":"translate", "value":"africa/central/226"},
      {"text": "Africa/Middle Africa/Gabon", "i18n":"", "class":"translate", "value":"africa/central/266"},
      {"text": "Africa/Middle Africa/Sao Tome and Principe", "i18n":"", "class":"translate", "value":"africa/central/678"},
      {"text": "Africa/Northern Africa", "i18n":"", "class":"translate", "value":"africa/north"},
      {"text": "Africa/Northern Africa/Algeria", "i18n":"", "class":"translate", "value":"africa/north/algeria"},
      {"text": "Africa/Northern Africa/Egypt", "i18n":"", "class":"translate", "value":"africa/north/818"},
      {"text": "Africa/Northern Africa/Libyan Arab Jamahiriya", "i18n":"", "class":"translate", "value":"africa/north/434"},
      {"text": "Africa/Northern Africa/Morocco", "i18n":"", "class":"translate", "value":"africa/north/morocco"},
      {"text": "Africa/Northern Africa/Sudan", "i18n":"", "class":"translate", "value":"africa/north/736"},
      {"text": "Africa/Northern Africa/Tunisia", "i18n":"", "class":"translate", "value":"africa/north/tunisia"},
      {"text": "Africa/Northern Africa/Western Sahara", "i18n":"", "class":"translate", "value":"africa/north/732"},
      {"text": "Africa/Southern Africa", "i18n":"", "class":"translate", "value":"africa/018"},
      {"text": "Africa/Southern Africa/Botswana", "i18n":"", "class":"translate", "value":"africa/018/072"},
      {"text": "Africa/Southern Africa/Lesotho", "i18n":"", "class":"translate", "value":"africa/018/426"},
      {"text": "Africa/Southern Africa/Namibia", "i18n":"", "class":"translate", "value":"africa/018/516"},
      {"text": "Africa/Southern Africa/South Africa", "i18n":"", "class":"translate", "value":"africa/018/710"},
      {"text": "Africa/Southern Africa/Swaziland", "i18n":"", "class":"translate", "value":"africa/018/748"},
      {"text": "Africa/Western Africa", "i18n":"", "class":"translate", "value":"africa/west"},
      {"text": "Africa/Western Africa/Benin", "i18n":"", "class":"translate", "value":"africa/west/204"},
      {"text": "Africa/Western Africa/Burkina Faso", "i18n":"", "class":"translate", "value":"africa/west/854"},
      {"text": "Africa/Western Africa/Cabo Verde", "i18n":"", "class":"translate", "value":"africa/west/caboverde"},
      {"text": "Africa/Western Africa/Cote d'Ivoire", "i18n":"", "class":"translate", "value":"africa/west/ivorycoast"},
      {"text": "Africa/Western Africa/Gambia", "i18n":"", "class":"translate", "value":"africa/west/270"},
      {"text": "Africa/Western Africa/Ghana", "i18n":"", "class":"translate", "value":"africa/west/288"},
      {"text": "Africa/Western Africa/Guinea", "i18n":"", "class":"translate", "value":"africa/west/324"},
      {"text": "Africa/Western Africa/Guinea-Bissau", "i18n":"", "class":"translate", "value":"africa/west/624"},
      {"text": "Africa/Western Africa/Liberia", "i18n":"", "class":"translate", "value":"africa/west/430"},
      {"text": "Africa/Western Africa/Mali", "i18n":"", "class":"translate", "value":"africa/west/mali"},
      {"text": "Africa/Western Africa/Mauritania", "i18n":"", "class":"translate", "value":"africa/west/mauritania"},
      {"text": "Africa/Western Africa/Niger", "i18n":"", "class":"translate", "value":"africa/west/562"},
      {"text": "Africa/Western Africa/Nigeria", "i18n":"", "class":"translate", "value":"africa/west/566"},
      {"text": "Africa/Western Africa/Saint Helena", "i18n":"", "class":"translate", "value":"africa/west/654"},
      {"text": "Africa/Western Africa/Senegal", "i18n":"", "class":"translate", "value":"africa/west/senegal"},
      {"text": "Africa/Western Africa/Sierra Leone", "i18n":"", "class":"translate", "value":"africa/west/694"},
      {"text": "Africa/Western Africa/Togo", "i18n":"", "class":"translate", "value":"africa/west/768"},
      {"text": "Americas", "i18n":"", "class":"translate", "value":"america"},
      {"text": "Americas/Caribbean", "i18n":"", "class":"translate", "value":"america/029"},
      {"text": "Americas/Caribbean/Anguilla", "i18n":"", "class":"translate", "value":"america/029/660"},
      {"text": "Americas/Caribbean/Antigua and Barbuda", "i18n":"", "class":"translate", "value":"america/029/028"},
      {"text": "Americas/Caribbean/Aruba", "i18n":"", "class":"translate", "value":"america/029/533"},
      {"text": "Americas/Caribbean/Bahamas", "i18n":"", "class":"translate", "value":"america/029/044"},
      {"text": "Americas/Caribbean/Barbados", "i18n":"", "class":"translate", "value":"america/029/052"},
      {"text": "Americas/Caribbean/British Virgin Islands", "i18n":"", "class":"translate", "value":"america/029/092"},
      {"text": "Americas/Caribbean/Cayman Islands", "i18n":"", "class":"translate", "value":"america/029/136"},
      {"text": "Americas/Caribbean/Cuba", "i18n":"", "class":"translate", "value":"america/029/192"},
      {"text": "Americas/Caribbean/Dominica", "i18n":"", "class":"translate", "value":"america/029/212"},
      {"text": "Americas/Caribbean/Dominican Republic", "i18n":"", "class":"translate", "value":"america/029/214"},
      {"text": "Americas/Caribbean/Grenada", "i18n":"", "class":"translate", "value":"america/029/308"},
      {"text": "Americas/Caribbean/Guadeloupe", "i18n":"", "class":"translate", "value":"america/029/312"},
      {"text": "Americas/Caribbean/Haiti", "i18n":"", "class":"translate", "value":"america/029/332"},
      {"text": "Americas/Caribbean/Jamaica", "i18n":"", "class":"translate", "value":"america/029/388"},
      {"text": "Americas/Caribbean/Martinique", "i18n":"", "class":"translate", "value":"america/029/474"},
      {"text": "Americas/Caribbean/Montserrat", "i18n":"", "class":"translate", "value":"america/029/500"},
      {"text": "Americas/Caribbean/Netherlands Antilles", "i18n":"", "class":"translate", "value":"america/029/530"},
      {"text": "Americas/Caribbean/Puerto Rico", "i18n":"", "class":"translate", "value":"america/029/630"},
      {"text": "Americas/Caribbean/Saint Kitts and Nevis", "i18n":"", "class":"translate", "value":"america/029/659"},
      {"text": "Americas/Caribbean/Saint Lucia", "i18n":"", "class":"translate", "value":"america/029/662"},
      {"text": "Americas/Caribbean/Saint Martin (French part)", "i18n":"", "class":"translate", "value":"america/029/663"},
      {"text": "Americas/Caribbean/Saint Vincent and the Grenadines", "i18n":"", "class":"translate", "value":"america/029/670"},
      {"text": "Americas/Caribbean/Saint-Barthélemy", "i18n":"", "class":"translate", "value":"america/029/652"},
      {"text": "Americas/Caribbean/Trinidad and Tobago", "i18n":"", "class":"translate", "value":"america/029/780"},
      {"text": "Americas/Caribbean/Turks and Caicos Islands", "i18n":"", "class":"translate", "value":"america/029/796"},
      {"text": "Americas/Caribbean/United States Virgin Islands", "i18n":"", "class":"translate", "value":"america/029/850"},
      {"text": "Americas/Central America", "i18n":"", "class":"translate", "value":"america/central"},
      {"text": "Americas/Central America/Belize", "i18n":"", "class":"translate", "value":"america/central/084"},
      {"text": "Americas/Central America/Costa Rica", "i18n":"", "class":"translate", "value":"america/central/188"},
      {"text": "Americas/Central America/El Salvador", "i18n":"", "class":"translate", "value":"america/central/222"},
      {"text": "Americas/Central America/Guatemala", "i18n":"", "class":"translate", "value":"america/central/320"},
      {"text": "Americas/Central America/Honduras", "i18n":"", "class":"translate", "value":"america/central/340"},
      {"text": "Americas/Central America/Mexico", "i18n":"", "class":"translate", "value":"america/central/484"},
      {"text": "Americas/Central America/Nicaragua", "i18n":"", "class":"translate", "value":"america/central/558"},
      {"text": "Americas/Central America/Panama", "i18n":"", "class":"translate", "value":"america/central/591"},
      {"text": "Americas/Northern America", "i18n":"", "class":"translate", "value":"america/north"},
      {"text": "Americas/Northern America/Bermuda", "i18n":"", "class":"translate", "value":"america/north/060"},
      {"text": "Americas/Northern America/Canada", "i18n":"", "class":"translate", "value":"america/north/canada"},
      {"text": "Americas/Northern America/Greenland", "i18n":"", "class":"translate", "value":"america/north/304"},
      {"text": "Americas/Northern America/Mexico", "i18n":"", "class":"translate", "value":"america/north/mexico"},
      {"text": "Americas/Northern America/Saint Pierre and Miquelon", "i18n":"", "class":"translate", "value":"america/north/666"},
      {"text": "Americas/Northern America/United States of America", "i18n":"", "class":"translate", "value":"america/north/usa"},
      {"text": "Americas/South America", "i18n":"", "class":"translate", "value":"america/south"},
      {"text": "Americas/South America/Argentina", "i18n":"", "class":"translate", "value":"america/south/032"},
      {"text": "Americas/South America/Bolivia", "i18n":"", "class":"translate", "value":"america/south/068"},
      {"text": "Americas/South America/Brazil", "i18n":"", "class":"translate", "value":"america/south/brazil"},
      {"text": "Americas/South America/Chile", "i18n":"", "class":"translate", "value":"america/south/152"},
      {"text": "Americas/South America/Colombia", "i18n":"", "class":"translate", "value":"america/south/170"},
      {"text": "Americas/South America/Ecuador", "i18n":"", "class":"translate", "value":"america/south/218"},
      {"text": "Americas/South America/Falkland Islands (Malvinas)", "i18n":"", "class":"translate", "value":"america/south/238"},
      {"text": "Americas/South America/French Guiana", "i18n":"", "class":"translate", "value":"america/south/254"},
      {"text": "Americas/South America/Guyana", "i18n":"", "class":"translate", "value":"america/south/328"},
      {"text": "Americas/South America/Paraguay", "i18n":"", "class":"translate", "value":"america/south/600"},
      {"text": "Americas/South America/Peru", "i18n":"", "class":"translate", "value":"america/south/604"},
      {"text": "Americas/South America/Suriname", "i18n":"", "class":"translate", "value":"america/south/740"},
      {"text": "Americas/South America/Uruguay", "i18n":"", "class":"translate", "value":"america/south/858"},
      {"text": "Americas/South America/Venezuela (Bolivarian Republic of)", "i18n":"", "class":"translate", "value":"america/south/862"},
      {"text": "Asia", "i18n":"", "class":"translate", "value":"asia"},
      {"text": "Asia/Central Asia", "i18n":"", "class":"translate", "value":"asia/143"},
      {"text": "Asia/Central Asia/Kazakhstan", "i18n":"", "class":"translate", "value":"asia/143/398"},
      {"text": "Asia/Central Asia/Kyrgyzstan", "i18n":"", "class":"translate", "value":"asia/143/417"},
      {"text": "Asia/Central Asia/Tajikistan", "i18n":"", "class":"translate", "value":"asia/143/762"},
      {"text": "Asia/Central Asia/Turkmenistan", "i18n":"", "class":"translate", "value":"asia/143/795"},
      {"text": "Asia/Central Asia/Uzbekistan", "i18n":"", "class":"translate", "value":"asia/143/860"},
      {"text": "Asia/Eastern Asia", "i18n":"", "class":"translate", "value":"asia/east"},
      {"text": "Asia/Eastern Asia/China", "i18n":"", "class":"translate", "value":"asia/east/china"},
      {"text": "Asia/Eastern Asia/Democratic People's Republic of Korea", "i18n":"", "class":"translate", "value":"asia/east/408"},
      {"text": "Asia/Eastern Asia/Hong Kong Special Administrative Region of China", "i18n":"", "class":"translate", "value":"asia/east/344"},
      {"text": "Asia/Eastern Asia/Japan", "i18n":"", "class":"translate", "value":"asia/east/japan"},
      {"text": "Asia/Eastern Asia/Macao Special Administrative Region of China", "i18n":"", "class":"translate", "value":"asia/east/446"},
      {"text": "Asia/Eastern Asia/Mongolia", "i18n":"", "class":"translate", "value":"asia/east/496"},
      {"text": "Asia/Eastern Asia/Republic of Korea", "i18n":"", "class":"translate", "value":"asia/east/southkorea"},
      {"text": "Asia/Eastern Asia/Taiwan", "i18n":"", "class":"translate", "value":"asia/east/taiwan"},
      {"text": "Asia/South-Eastern Asia", "i18n":"", "class":"translate", "value":"asia/southeast"},
      {"text": "Asia/South-Eastern Asia/Brunei Darussalam", "i18n":"", "class":"translate", "value":"asia/southeast/096"},
      {"text": "Asia/South-Eastern Asia/Cambodia", "i18n":"", "class":"translate", "value":"asia/southeast/116"},
      {"text": "Asia/South-Eastern Asia/Indonesia", "i18n":"", "class":"translate", "value":"asia/southeast/indonesia"},
      {"text": "Asia/South-Eastern Asia/Lao People's Democratic Republic", "i18n":"", "class":"translate", "value":"asia/southeast/418"},
      {"text": "Asia/South-Eastern Asia/Malaysia", "i18n":"", "class":"translate", "value":"asia/southeast/malaysia"},
      {"text": "Asia/South-Eastern Asia/Myanmar", "i18n":"", "class":"translate", "value":"asia/southeast/104"},
      {"text": "Asia/South-Eastern Asia/Philippines", "i18n":"", "class":"translate", "value":"asia/southeast/608"},
      {"text": "Asia/South-Eastern Asia/Singapore", "i18n":"", "class":"translate", "value":"asia/southeast/singapore"},
      {"text": "Asia/South-Eastern Asia/Thailand", "i18n":"", "class":"translate", "value":"asia/southeast/thailand"},
      {"text": "Asia/South-Eastern Asia/Timor-Leste", "i18n":"", "class":"translate", "value":"asia/southeast/626"},
      {"text": "Asia/South-Eastern Asia/Viet Nam", "i18n":"", "class":"translate", "value":"asia/southeast/704"},
      {"text": "Asia/Southern Asia", "i18n":"", "class":"translate", "value":"asia/south"},
      {"text": "Asia/Southern Asia/Afghanistan", "i18n":"", "class":"translate", "value":"asia/south/004"},
      {"text": "Asia/Southern Asia/Bangladesh", "i18n":"", "class":"translate", "value":"asia/south/050"},
      {"text": "Asia/Southern Asia/Bhutan", "i18n":"", "class":"translate", "value":"asia/south/064"},
      {"text": "Asia/Southern Asia/India", "i18n":"", "class":"translate", "value":"asia/south/india"},
      {"text": "Asia/Southern Asia/Iran, Islamic Republic of", "i18n":"", "class":"translate", "value":"asia/south/364"},
      {"text": "Asia/Southern Asia/Maldives", "i18n":"", "class":"translate", "value":"asia/south/462"},
      {"text": "Asia/Southern Asia/Nepal", "i18n":"", "class":"translate", "value":"asia/south/524"},
      {"text": "Asia/Southern Asia/Pakistan", "i18n":"", "class":"translate", "value":"asia/south/586"},
      {"text": "Asia/Southern Asia/Sri Lanka", "i18n":"", "class":"translate", "value":"asia/south/144"},
      {"text": "Asia/Western Asia", "i18n":"", "class":"translate", "value":"asia/145"},
      {"text": "Asia/Western Asia/Armenia", "i18n":"", "class":"translate", "value":"asia/145/051"},
      {"text": "Asia/Western Asia/Azerbaijan", "i18n":"", "class":"translate", "value":"asia/145/031"},
      {"text": "Asia/Western Asia/Bahrain", "i18n":"", "class":"translate", "value":"asia/145/048"},
      {"text": "Asia/Western Asia/Cyprus", "i18n":"", "class":"translate", "value":"asia/145/196"},
      {"text": "Asia/Western Asia/Georgia", "i18n":"", "class":"translate", "value":"asia/145/268"},
      {"text": "Asia/Western Asia/Iraq", "i18n":"", "class":"translate", "value":"asia/145/368"},
      {"text": "Asia/Western Asia/Israel", "i18n":"", "class":"translate", "value":"asia/145/376"},
      {"text": "Asia/Western Asia/Jordan", "i18n":"", "class":"translate", "value":"asia/145/400"},
      {"text": "Asia/Western Asia/Kuwait", "i18n":"", "class":"translate", "value":"asia/145/414"},
      {"text": "Asia/Western Asia/Lebanon", "i18n":"", "class":"translate", "value":"asia/145/422"},
      {"text": "Asia/Western Asia/Occupied Palestinian Territory", "i18n":"", "class":"translate", "value":"asia/145/275"},
      {"text": "Asia/Western Asia/Oman", "i18n":"", "class":"translate", "value":"asia/145/512"},
      {"text": "Asia/Western Asia/Qatar", "i18n":"", "class":"translate", "value":"asia/145/634"},
      {"text": "Asia/Western Asia/Saudi Arabia", "i18n":"", "class":"translate", "value":"asia/145/682"},
      {"text": "Asia/Western Asia/Syrian Arab Republic", "i18n":"", "class":"translate", "value":"asia/145/760"},
      {"text": "Asia/Western Asia/Turkey", "i18n":"", "class":"translate", "value":"asia/145/792"},
      {"text": "Asia/Western Asia/United Arab Emirates", "i18n":"", "class":"translate", "value":"asia/145/784"},
      {"text": "Asia/Western Asia/Yemen", "i18n":"", "class":"translate", "value":"asia/145/887"},
      {"text": "Europe", "i18n":"", "class":"translate", "value":"europe"},
      {"text": "Europe/Eastern Europe", "i18n":"", "class":"translate", "value":"europe/east"},
      {"text": "Europe/Eastern Europe/Belarus", "i18n":"", "class":"translate", "value":"europe/east/112"},
      {"text": "Europe/Eastern Europe/Bulgaria", "i18n":"", "class":"translate", "value":"europe/east/bulgariya"},
      {"text": "Europe/Eastern Europe/Czech Republic", "i18n":"", "class":"translate", "value":"europe/east/203"},
      {"text": "Europe/Eastern Europe/Hungary", "i18n":"", "class":"translate", "value":"europe/east/348"},
      {"text": "Europe/Eastern Europe/Poland", "i18n":"", "class":"translate", "value":"europe/east/poland"},
      {"text": "Europe/Eastern Europe/Republic of Moldova", "i18n":"", "class":"translate", "value":"europe/east/498"},
      {"text": "Europe/Eastern Europe/Romania", "i18n":"", "class":"translate", "value":"europe/east/642"},
      {"text": "Europe/Eastern Europe/Russian Federation", "i18n":"", "class":"translate", "value":"europe/east/643"},
      {"text": "Europe/Eastern Europe/Slovakia", "i18n":"", "class":"translate", "value":"europe/east/703"},
      {"text": "Europe/Eastern Europe/Ukraine", "i18n":"", "class":"translate", "value":"europe/east/804"},
      {"text": "Europe/Northern Europe", "i18n":"", "class":"translate", "value":"europe/north"},
      {"text": "Europe/Northern Europe/Channel Islands", "i18n":"", "class":"translate", "value":"europe/north/830"},
      {"text": "Europe/Northern Europe/Denmark", "i18n":"", "class":"translate", "value":"europe/north/denmark"},
      {"text": "Europe/Northern Europe/Estonia", "i18n":"", "class":"translate", "value":"europe/north/233"},
      {"text": "Europe/Northern Europe/Faeroe Islands", "i18n":"", "class":"translate", "value":"europe/north/234"},
      {"text": "Europe/Northern Europe/Finland", "i18n":"", "class":"translate", "value":"europe/north/finland"},
      {"text": "Europe/Northern Europe/Guernsey", "i18n":"", "class":"translate", "value":"europe/north/831"},
      {"text": "Europe/Northern Europe/Iceland", "i18n":"", "class":"translate", "value":"europe/north/352"},
      {"text": "Europe/Northern Europe/Ireland", "i18n":"", "class":"translate", "value":"europe/north/372"},
      {"text": "Europe/Northern Europe/Isle of Man", "i18n":"", "class":"translate", "value":"europe/north/833"},
      {"text": "Europe/Northern Europe/Jersey", "i18n":"", "class":"translate", "value":"europe/north/832"},
      {"text": "Europe/Northern Europe/Latvia", "i18n":"", "class":"translate", "value":"europe/north/428"},
      {"text": "Europe/Northern Europe/Lithuania", "i18n":"", "class":"translate", "value":"europe/north/440"},
      {"text": "Europe/Northern Europe/Norway", "i18n":"", "class":"translate", "value":"europe/north/norway"},
      {"text": "Europe/Northern Europe/Svalbard and Jan Mayen Islands", "i18n":"", "class":"translate", "value":"europe/north/744"},
      {"text": "Europe/Northern Europe/Sweden", "i18n":"", "class":"translate", "value":"europe/north/sweden"},
      {"text": "Europe/Northern Europe/United Kingdom of Great Britain and Northern Ireland", "i18n":"", "class":"translate", "value":"europe/north/uk"},
      {"text": "Europe/Northern Europe/Åland Islands", "i18n":"", "class":"translate", "value":"europe/north/248"},
      {"text": "Europe/Southern Europe", "i18n":"", "class":"translate", "value":"europe/south"},
      {"text": "Europe/Southern Europe/Albania", "i18n":"", "class":"translate", "value":"europe/south/008"},
      {"text": "Europe/Southern Europe/Andorra", "i18n":"", "class":"translate", "value":"europe/south/020"},
      {"text": "Europe/Southern Europe/Bosnia and Herzegovina", "i18n":"", "class":"translate", "value":"europe/south/070"},
      {"text": "Europe/Southern Europe/Croatia", "i18n":"", "class":"translate", "value":"europe/south/191"},
      {"text": "Europe/Southern Europe/Gibraltar", "i18n":"", "class":"translate", "value":"europe/south/292"},
      {"text": "Europe/Southern Europe/Greece", "i18n":"", "class":"translate", "value":"europe/south/greece"},
      {"text": "Europe/Southern Europe/Holy See", "i18n":"", "class":"translate", "value":"europe/south/336"},
      {"text": "Europe/Southern Europe/Italy", "i18n":"", "class":"translate", "value":"europe/south/italy"},
      {"text": "Europe/Southern Europe/Malta", "i18n":"", "class":"translate", "value":"europe/south/470"},
      {"text": "Europe/Southern Europe/Montenegro", "i18n":"", "class":"translate", "value":"europe/south/499"},
      {"text": "Europe/Southern Europe/Portugal", "i18n":"", "class":"translate", "value":"europe/south/portugal"},
      {"text": "Europe/Southern Europe/San Marino", "i18n":"", "class":"translate", "value":"europe/south/674"},
      {"text": "Europe/Southern Europe/Serbia", "i18n":"", "class":"translate", "value":"europe/south/688"},
      {"text": "Europe/Southern Europe/Slovenia", "i18n":"", "class":"translate", "value":"europe/south/705"},
      {"text": "Europe/Southern Europe/Spain", "i18n":"", "class":"translate", "value":"europe/south/spain"},
      {"text": "Europe/Southern Europe/The former Yugoslav Republic of Macedonia", "i18n":"", "class":"translate", "value":"europe/south/807"},
      {"text": "Europe/Western Europe", "i18n":"", "class":"translate", "value":"europe/west"},
      {"text": "Europe/Western Europe/Austria", "i18n":"", "class":"translate", "value":"europe/west/austria"},
      {"text": "Europe/Western Europe/Belgium", "i18n":"", "class":"translate", "value":"europe/west/belgium"},
      {"text": "Europe/Western Europe/Eire", "i18n":"", "class":"translate", "value":"europe/west/ireland"},
      {"text": "Europe/Western Europe/France", "i18n":"", "class":"translate", "value":"europe/west/france"},
      {"text": "Europe/Western Europe/Germany", "i18n":"", "class":"translate", "value":"europe/west/germany"},
      {"text": "Europe/Western Europe/Liechtenstein", "i18n":"", "class":"translate", "value":"europe/west/lichtenstein"},
      {"text": "Europe/Western Europe/Luxembourg", "i18n":"", "class":"translate", "value":"europe/west/luxembourg"},
      {"text": "Europe/Western Europe/Monaco", "i18n":"", "class":"translate", "value":"europe/west/492"},
      {"text": "Europe/Western Europe/Netherlands", "i18n":"", "class":"translate", "value":"europe/west/netherlands"},
      {"text": "Europe/Western Europe/Switzerland", "i18n":"", "class":"translate", "value":"europe/west/switzerland"},
      {"text": "Europe/Western Europe/United Kingdom", "i18n":"", "class":"translate", "value":"europe/west/uk"},
      {"text": "Oceania", "i18n":"", "class":"translate", "value":"oceania"},
      {"text": "Oceania/Australia", "i18n":"", "class":"translate", "value":"oceania/australia"},
      {"text": "Oceania/Melanesia", "i18n":"", "class":"translate", "value":"oceania/054"},
      {"text": "Oceania/Melanesia/Fiji", "i18n":"", "class":"translate", "value":"oceania/054/242"},
      {"text": "Oceania/Melanesia/New Caledonia", "i18n":"", "class":"translate", "value":"oceania/054/540"},
      {"text": "Oceania/Melanesia/Papua New Guinea", "i18n":"", "class":"translate", "value":"oceania/054/598"},
      {"text": "Oceania/Melanesia/Solomon Islands", "i18n":"", "class":"translate", "value":"oceania/054/090"},
      {"text": "Oceania/Melanesia/Vanuatu", "i18n":"", "class":"translate", "value":"oceania/054/548"},
      {"text": "Oceania/Micronesia", "i18n":"", "class":"translate", "value":"oceania/057"},
      {"text": "Oceania/Micronesia/Guam", "i18n":"", "class":"translate", "value":"oceania/057/316"},
      {"text": "Oceania/Micronesia/Kiribati", "i18n":"", "class":"translate", "value":"oceania/057/296"},
      {"text": "Oceania/Micronesia/Marshall Islands", "i18n":"", "class":"translate", "value":"oceania/057/584"},
      {"text": "Oceania/Micronesia/Micronesia, Federated States of", "i18n":"", "class":"translate", "value":"oceania/057/583"},
      {"text": "Oceania/Micronesia/Nauru", "i18n":"", "class":"translate", "value":"oceania/057/520"},
      {"text": "Oceania/Micronesia/Northern Mariana Islands", "i18n":"", "class":"translate", "value":"oceania/057/580"},
      {"text": "Oceania/Micronesia/Palau", "i18n":"", "class":"translate", "value":"oceania/057/585"},
      {"text": "Oceania/New Zealand", "i18n":"", "class":"translate", "value":"oceania/newzealand"},
      {"text": "Oceania/Norfolk Island", "i18n":"", "class":"translate", "value":"oceania/574"},
      {"text": "Oceania/Polynesia", "i18n":"", "class":"translate", "value":"oceania/061"},
      {"text": "Oceania/Polynesia/American Samoa", "i18n":"", "class":"translate", "value":"oceania/061/016"},
      {"text": "Oceania/Polynesia/Cook Islands", "i18n":"", "class":"translate", "value":"oceania/061/184"},
      {"text": "Oceania/Polynesia/French Polynesia", "i18n":"", "class":"translate", "value":"oceania/061/258"},
      {"text": "Oceania/Polynesia/Niue", "i18n":"", "class":"translate", "value":"oceania/061/570"},
      {"text": "Oceania/Polynesia/Pitcairn", "i18n":"", "class":"translate", "value":"oceania/061/612"},
      {"text": "Oceania/Polynesia/Samoa", "i18n":"", "class":"translate", "value":"oceania/061/882"},
      {"text": "Oceania/Polynesia/Tokelau", "i18n":"", "class":"translate", "value":"oceania/061/772"},
      {"text": "Oceania/Polynesia/Tonga", "i18n":"", "class":"translate", "value":"oceania/061/776"},
      {"text": "Oceania/Polynesia/Tuvalu", "i18n":"", "class":"translate", "value":"oceania/061/798"},
      {"text": "Oceania/Polynesia/Wallis and Futuna Islands", "i18n":"", "class":"translate", "value":"oceania/061/876"},
    ],
    "getComputerStorageCapacity": [
      {"text": "", "i18n":"", "class":"translate", "value":""},
      {"text": "Finite Storage Capacity", "i18n":"", "class":"translate", "value":"finite"},
      {"text": "Finite Storage Capacity/1 TB Storage Capacity", "i18n":"", "class":"translate", "value":"finite/1000"},
      {"text": "Finite Storage Capacity/1.5 TB Storage Capacity", "i18n":"", "class":"translate", "value":"finite/1500"},
      {"text": "Finite Storage Capacity/10 GB Storage Capacity", "i18n":"", "class":"translate", "value":"finite/10"},
      {"text": "Finite Storage Capacity/100 GB Storage Capacity", "i18n":"", "class":"translate", "value":"finite/100"},
      {"text": "Finite Storage Capacity/128 GB Storage Capacity", "i18n":"", "class":"translate", "value":"finite/128"},
      {"text": "Finite Storage Capacity/16 GB Storage Capacity", "i18n":"", "class":"translate", "value":"finite/16"},
      {"text": "Finite Storage Capacity/160 GB Storage Capacity", "i18n":"", "class":"translate", "value":"finite/160"},
      {"text": "Finite Storage Capacity/2 TB Storage Capacity", "i18n":"", "class":"translate", "value":"finite/2000"},
      {"text": "Finite Storage Capacity/20 GB Storage Capacity", "i18n":"", "class":"translate", "value":"finite/20"},
      {"text": "Finite Storage Capacity/200 GB Storage Capacity", "i18n":"", "class":"translate", "value":"finite/200"},
      {"text": "Finite Storage Capacity/300 GB Storage Capacity", "i18n":"", "class":"translate", "value":"finite/300"},
      {"text": "Finite Storage Capacity/32 GB Storage Capacity", "i18n":"", "class":"translate", "value":"finite/32"},
      {"text": "Finite Storage Capacity/320 GB Storage Capacity", "i18n":"", "class":"translate", "value":"finite/320"},
      {"text": "Finite Storage Capacity/4 TB Storage Capacity", "i18n":"", "class":"translate", "value":"finite/4000"},
      {"text": "Finite Storage Capacity/40 GB Storage Capacity", "i18n":"", "class":"translate", "value":"finite/40"},
      {"text": "Finite Storage Capacity/500 GB Storage Capacity", "i18n":"", "class":"translate", "value":"finite/500"},
      {"text": "Finite Storage Capacity/64 GB Storage Capacity", "i18n":"", "class":"translate", "value":"finite/64"},
      {"text": "Finite Storage Capacity/750 GB Storage Capacity", "i18n":"", "class":"translate", "value":"finite/750"},
      {"text": "Finite Storage Capacity/80 GB Storage Capacity", "i18n":"", "class":"translate", "value":"finite/80"},
      {"text": "Finite Storage Capacity/8GB Storage Capacity", "i18n":"", "class":"translate", "value":"finite/8"},
      {"text": "Infinite Storage Capacity", "i18n":"", "class":"translate", "value":"infinite"},
    ],
    "getComputerStorageInterface": [
      {"text": "", "i18n":"", "class":"translate", "value":""},
      {"text": "Network Attached Storage", "i18n":"", "class":"translate", "value":"nas"},
      {"text": "Serial Advanced Technology Attachment", "i18n":"", "class":"translate", "value":"sata"},
      {"text": "Serial Attached SCSI", "i18n":"", "class":"translate", "value":"sas"},
      {"text": "Storage Area Network", "i18n":"", "class":"translate", "value":"san"},
      {"text": "Universal Serial Bus", "i18n":"", "class":"translate", "value":"usb"},
      {"text": "Universal Serial Bus/USB2", "i18n":"", "class":"translate", "value":"usb/usb2"},
      {"text": "Universal Serial Bus/USB3", "i18n":"", "class":"translate", "value":"usb/usb3"},
    ],
    "getComputerStorageRedundancy": [
      {"text": "", "i18n":"", "class":"translate", "value":""},
      {"text": "Distributed Hash Table", "i18n":"", "class":"translate", "value":"dht"},
      {"text": "Redundant Array of Independent Disks", "i18n":"", "class":"translate", "value":"raid"},
      {"text": "Redundant Array of Independent Disks/Redundant Array of Independent Disks Level 0", "i18n":"", "class":"translate", "value":"raid/level0"},
      {"text": "Redundant Array of Independent Disks/Redundant Array of Independent Disks Level 0 + Level 1", "i18n":"", "class":"translate", "value":"raid/nested01"},
      {"text": "Redundant Array of Independent Disks/Redundant Array of Independent Disks Level 1", "i18n":"", "class":"translate", "value":"raid/level1"},
      {"text": "Redundant Array of Independent Disks/Redundant Array of Independent Disks Level 1 + Level 0", "i18n":"", "class":"translate", "value":"raid/nested10"},
      {"text": "Redundant Array of Independent Disks/Redundant Array of Independent Disks Level 2", "i18n":"", "class":"translate", "value":"raid/level2"},
      {"text": "Redundant Array of Independent Disks/Redundant Array of Independent Disks Level 3", "i18n":"", "class":"translate", "value":"raid/level3"},
      {"text": "Redundant Array of Independent Disks/Redundant Array of Independent Disks Level 4", "i18n":"", "class":"translate", "value":"raid/level4"},
      {"text": "Redundant Array of Independent Disks/Redundant Array of Independent Disks Level 5", "i18n":"", "class":"translate", "value":"raid/level5"},
      {"text": "Redundant Array of Independent Disks/Redundant Array of Independent Disks Level 5 + Level 0", "i18n":"", "class":"translate", "value":"raid/nested50"},
      {"text": "Redundant Array of Independent Disks/Redundant Array of Independent Disks Level 6", "i18n":"", "class":"translate", "value":"raid/level6"},
    ],
    "getComputerNetwork": [
      {"text": "", "i18n":"", "class":"translate", "value":""}
    ],
    "getStorageTechnology": [
      {"text": "", "i18n":"", "class":"translate", "value":""},
      {"text": "Disk Storage", "i18n":"", "class":"translate", "value":"disk"},
      {"text": "Disk Storage/10,000 rpm", "i18n":"", "class":"translate", "value":"disk/10000"},
      {"text": "Disk Storage/15,000 rpm", "i18n":"", "class":"translate", "value":"disk/15000"},
      {"text": "Disk Storage/5,400 rpm", "i18n":"", "class":"translate", "value":"disk/5400"},
      {"text": "Disk Storage/7,200 rpm", "i18n":"", "class":"translate", "value":"disk/7200"},
      {"text": "ram", "i18n":"", "class":"translate", "value":"ram"},
      {"text": "ssd", "i18n":"", "class":"translate", "value":"ssd"}
    ]
  };

  /* ====================================================================== */
  /*                          ERP5 Field Definitions                        */
  /* ====================================================================== */
  // This is the JSON field definition of all fields used in ERP5 portal types
  // All fields listed here have UI and CSS set, so for example you can just
  // add a StringField by providing the JSON config below and then using
  // my_title as pointer to this configuration to generate the element.

  // TODO: find a way to inherit
  // NOTE: anytime a field is generated all properties can be overriden
  // NOTE: includes i18n and validation triggers (not implemented)
  priv.field_definitions = {
    "services": {
      "my_title": {
        "type": "StringField",
        "widget": {
          "id": "my_title",
          "alternate_name": "my_title",
          "title": "Title",
          "title_i18n": "computer.fields.my_title.title",
          "description": "The name of a document in ERP5",
          "description_i18n": "computer.fields.my_title.desc",
          "default": null,
          "css_class": null,
          "hidden": false,
          "display_width": 30,
          "maximum_input": null,
          "extra": {"data-clear-btn":"true"}
        },
        "validator": {
          "enabled": true,
          "editable": true,
          "external_validator": null,
          "required": null,
          "preserve_whitespace": null,
          "unicode": null,
          "maximum_length": null,
          "truncate": null
        },
        "messages": {
          "external_validator_failed": {
            "message": "The input failed the external validator.",
            "i18n": "generic.errors.fields.my_title.validator"
          },
          "required_not_found": {
            "message": "Input is required but no input given.",
            "i18n": "generic.errors.common.no_input"
          },
          "too_long": {
            "message":"Too much input was given.",
            "i18n": "generic.errors.common.too_long"
          }
        }
      }
    },
    "invoices": {
      "my_invoice_date": {
        "type": "DateTimeField",
        "widget": {
          "id": "my_invoice_date",
          "alternate_name": "my_invoice_date",
          "title": "Date",
          "title_i18n": "computer.fields.my_invoice_date.title",
          "description": "The name of a document in ERP5",
          "description_i18n": "computer.fields.my_invoice_date.desc",
          "default": null,
          "css_class": null,
          "hidden": null,
          "default_to_now": null,
          "date_separator": null,
          "time_separator": null,
          "input_style": null,
          "input_order": null,
          "display_date_only": null,
          "am_pm_time_style": null,
          "display_timezone": null,
          "hide_day": null,
          "hidden_day_is_last_day_of_month": null
        },
        "properties": {
          "enabled": true,
          "editable": true,
          "external_validator": null,
          "required": null,
          "start_datetime": null,
          "end_datetime": null,
          "allow_empty_time": null
        },
        "messages": {
          "external_validator_failed": {
            "message": "The input failed the external validator.",
            "i18n": "generic.errors.fields.my_title.validator"
          },
          "required_not_found": {
            "message": "Input is required but no input given.",
            "i18n": "generic.errors.common.no_input"
          },
          "not_datetime": {
            "message": "You did not enter a valid date and time.",
            "i18n": ""
          },
          "datetime_out_of_range": {
            "message": "The date and time you entered were out of range.",
            "i18n": ""
          }
        }
      },
      "my_total_price": {
        "type": "FloatField",
        "widget": {
          "id": "my_total_price",
          "alternate_name": "my_total_price",
          "title": "Total Price",
          "title_i18n": "computer.fields.my_total_price.title",
          "description": "The name of a document in ERP5",
          "description_i18n": "computer.fields.my_total_price.desc",
          "default": null,
          "css_class": null,
          "hidden": false,
          "display_width": 30,
          "maximum_input": null,
          "extra": {"data-clear-btn":"true"},
          "input_style": null,
          "precision": null
        },
        "validator": {
          "enabled": true,
          "editable": true,
          "external_validator": null,
          "required": null,
          "preserve_whitespace": null,
          "unicode": null
        },
        "messages": {
          "external_validator_failed": {
            "message": "The input failed the external validator.",
            "i18n": "generic.errors.fields.my_title.validator"
          },
          "required_not_found": {
            "message": "Input is required but no input given.",
            "i18n": "generic.errors.common.no_input"
          },
          "not_float": {
            "message":"You did not enter a floating number.",
            "i18n": "generic.errors.common.no_float"
          }
        }
      },
      "my_price_currency": {
        "type": "ListField",
        "widget": {
          "id": "my_price_currency",
          "alternate_name": "my_price_currency",
          "title": "Currency",
          "title_i18n": "computer.fields.my_price_currency.title",
          "description": "The name of a document in ERP5",
          "description_i18n": "computer.fields.my_price_currency.desc",
          "default": null,
          "css_class": null,
          "hidden": false,
          "size": 1,
          "items": "getCurrencies",
          "select_first_item": true,
          "extra_per_item": null,
          "extra": null
        },
        "validator": {
          "enabled": true,
          "editable": true,
          "external_validator": null,
          "required": null,
          "preserve_whitespace": null,
          "unicode": null
        },
        "messages": {
          "external_validator_failed": {
            "message": "The input failed the external validator.",
            "i18n": "generic.errors.fields.my_title.validator"
          },
          "required_not_found": {
            "message": "Input is required but no input given.",
            "i18n": "generic.errors.common.no_input"
          },
          "unknown_selection": {
            "message":"You selected on option not on the menu",
            "i18n": "generic.errors.common.unkown_item"
          }
        }
      },
      "my_translated_simulation_state_title": {
        "type": "StringField",
        "widget": {
          "id": "my_translated_simulation_state_title",
          "alternate_name": "my_translated_simulation_state_title",
          "title": "State",
          "title_i18n": "computer.fields.my_translated_simulation_state_title.title",
          "description": "The name of a document in ERP5",
          "description_i18n": "computer.fields.my_translated_simulation_state_title.desc",
          "default": null,
          "css_class": null,
          "hidden": false,
          "display_width": 30,
          "maximum_input": null,
          "extra": {"data-clear-btn":"true"}
        },
        "validator": {
          "enabled": true,
          "editable": true,
          "external_validator": null,
          "required": null,
          "preserve_whitespace": null,
          "unicode": null,
          "maximum_length": null,
          "truncate": null
        },
        "messages": {
          "external_validator_failed": {
            "message": "The input failed the external validator.",
            "i18n": "generic.errors.fields.my_title.validator"
          },
          "required_not_found": {
            "message": "Input is required but no input given.",
            "i18n": "generic.errors.common.no_input"
          },
          "too_long": {
            "message":"Too much input was given.",
            "i18n": "generic.errors.common.too_long"
          }
        }
      }
    },
    "networks": {
      "my_title": {
        "type": "StringField",
        "widget": {
          "id": "my_title",
          "alternate_name": "my_title",
          "title": "Title",
          "title_i18n": "computer.fields.my_title.title",
          "description": "The name of a document in ERP5",
          "description_i18n": "computer.fields.my_title.desc",
          "default": null,
          "css_class": null,
          "hidden": false,
          "display_width": 30,
          "maximum_input": null,
          "extra": {"data-clear-btn":"true"}
        },
        "validator": {
          "enabled": true,
          "editable": true,
          "external_validator": null,
          "required": null,
          "preserve_whitespace": null,
          "unicode": null,
          "maximum_length": null,
          "truncate": null
        },
        "messages": {
          "external_validator_failed": {
            "message": "The input failed the external validator.",
            "i18n": "generic.errors.fields.my_title.validator"
          },
          "required_not_found": {
            "message": "Input is required but no input given.",
            "i18n": "generic.errors.common.no_input"
          },
          "too_long": {
            "message":"Too much input was given.",
            "i18n": "generic.errors.common.too_long"
          }
        }
      },
      "my_reference": {
        "type": "StringField",
        "widget": {
          "id": "my_reference",
          "alternate_name": "my_reference",
          "title": "Reference",
          "title_i18n": "computer.fields.my_reference.title",
          "description": "The name of a document in ERP5",
          "description_i18n": "computer.fields.my_reference.desc",
          "default": null,
          "css_class": null,
          "hidden": false,
          "display_width": 30,
          "maximum_input": null,
          "extra": {"data-clear-btn":"true"}
        },
        "validator": {
          "enabled": true,
          "editable": true,
          "external_validator": null,
          "required": null,
          "preserve_whitespace": null,
          "unicode": null,
          "maximum_length": null,
          "truncate": null
        },
        "messages": {
          "external_validator_failed": {
            "message": "The input failed the external validator.",
            "i18n": "generic.errors.fields.my_title.validator"
          },
          "required_not_found": {
            "message": "Input is required but no input given.",
            "i18n": "generic.errors.common.no_input"
          },
          "too_long": {
            "message":"Too much input was given.",
            "i18n": "generic.errors.common.too_long"
          }
        }
      }
    },
    "computer": {
      "my_title": {
        "type": "StringField",
        "widget": {
          "id": "my_title",
          "alternate_name": "my_title",
          "title": "Title",
          "title_i18n": "computer.fields.my_title.title",
          "description": "The name of a document in ERP5",
          "description_i18n": "computer.fields.my_title.desc",
          "default": null,
          "css_class": null,
          "hidden": false,
          "display_width": 30,
          "maximum_input": null,
          "extra": {"data-clear-btn":"true"}
        },
        "validator": {
          "enabled": true,
          "editable": true,
          "external_validator": null,
          "required": null,
          "preserve_whitespace": null,
          "unicode": null,
          "maximum_length": null,
          "truncate": null
        },
        "messages": {
          "external_validator_failed": {
            "message": "The input failed the external validator.",
            "i18n": "generic.errors.fields.my_title.validator"
          },
          "required_not_found": {
            "message": "Input is required but no input given.",
            "i18n": "generic.errors.common.no_input"
          },
          "too_long": {
            "message":"Too much input was given.",
            "i18n": "generic.errors.common.too_long"
          }
        }
      },
      "my_reference": {
        "type": "StringField",
        "widget": {
          "id": "my_reference",
          "alternate_name": "my_reference",
          "title": "Reference",
          "title_i18n": "computer.fields.my_reference.title",
          "description": "The name of a document in ERP5",
          "description_i18n": "computer.fields.my_reference.desc",
          "default": null,
          "css_class": null,
          "hidden": false,
          "display_width": 30,
          "maximum_input": null,
          "extra": {"data-clear-btn":"true"}
        },
        "validator": {
          "enabled": true,
          "editable": true,
          "external_validator": null,
          "required": null,
          "preserve_whitespace": null,
          "unicode": null,
          "maximum_length": null,
          "truncate": null
        },
        "messages": {
          "external_validator_failed": {
            "message": "The input failed the external validator.",
            "i18n": "generic.errors.fields.my_title.validator"
          },
          "required_not_found": {
            "message": "Input is required but no input given.",
            "i18n": "generic.errors.common.no_input"
          },
          "too_long": {
            "message":"Too much input was given.",
            "i18n": "generic.errors.common.too_long"
          }
        }
      },
      "my_group": {
        "type": "ListField",
        "widget": {
          "id": "my_group",
          "alternate_name": "my_group",
          "title": "Group",
          "title_i18n": "computer.fields.my_group.title",
          "description": "The name of a document in ERP5",
          "description_i18n": "computer.fields.my_group.desc",
          "default": null,
          "css_class": null,
          "hidden": false,
          "size": 1,
          "items": "getComputerGroups",
          "select_first_item": true,
          "extra_per_item": null,
          "extra": null
        },
        "validator": {
          "enabled": true,
          "editable": true,
          "external_validator": null,
          "required": null,
          "preserve_whitespace": null,
          "unicode": null
        },
        "messages": {
          "external_validator_failed": {
            "message": "The input failed the external validator.",
            "i18n": "generic.errors.fields.my_title.validator"
          },
          "required_not_found": {
            "message": "Input is required but no input given.",
            "i18n": "generic.errors.common.no_input"
          },
          "unknown_selection": {
            "message":"You selected on option not on the menu",
            "i18n": "generic.errors.common.unkown_item"
          }
        }
      },
      "my_cpu_core": {
        "type": "ListField",
        "widget": {
          "id": "my_cpu_core",
          "alternate_name": "my_cpu_core",
          "title": "CPU Core",
          "title_i18n": "computer.fields.my_cpu_core.title",
          "description": "The name of a document in ERP5",
          "description_i18n": "computer.fields.my_cpu_core.desc",
          "default": null,
          "css_class": null,
          "hidden": false,
          "size": 1,
          "items": "getComputerCPUCore",
          "select_first_item": true,
          "extra_per_item": null,
          "extra": null
        },
        "validator": {
          "enabled": true,
          "editable": true,
          "external_validator": null,
          "required": null,
          "preserve_whitespace": null,
          "unicode": null
        },
        "messages": {
          "external_validator_failed": {
            "message": "The input failed the external validator.",
            "i18n": "generic.errors.fields.my_title.validator"
          },
          "required_not_found": {
            "message": "Input is required but no input given.",
            "i18n": "generic.errors.common.no_input"
          },
          "unknown_selection": {
            "message":"You selected on option not on the menu",
            "i18n": "generic.errors.common.unkown_item"
          }
        }
      },
      "my_cpu_frequency": {
        "type": "ListField",
        "widget": {
          "id": "my_cpu_frequency",
          "alternate_name": "my_cpu_frequency",
          "title": "CPU Frequency",
          "title_i18n": "computer.fields.my_cpu_frequency.title",
          "description": "The name of a document in ERP5",
          "description_i18n": "computer.fields.my_cpu_frequency.desc",
          "default": null,
          "css_class": null,
          "hidden": false,
          "size": 1,
          "items": "getComputerCPUFrequency",
          "select_first_item": true,
          "extra_per_item": null,
          "extra": null
        },
        "validator": {
          "enabled": true,
          "editable": true,
          "external_validator": null,
          "required": null,
          "preserve_whitespace": null,
          "unicode": null
        },
        "messages": {
          "external_validator_failed": {
            "message": "The input failed the external validator.",
            "i18n": "generic.errors.fields.my_title.validator"
          },
          "required_not_found": {
            "message": "Input is required but no input given.",
            "i18n": "generic.errors.common.no_input"
          },
          "unknown_selection": {
            "message":"You selected on option not on the menu",
            "i18n": "generic.errors.common.unkown_item"
          }
        }
      },
      "my_cpu_type": {
        "type": "ListField",
        "widget": {
          "id": "my_cpu_type",
          "alternate_name": "my_cpu_type",
          "title": "CPU Type",
          "title_i18n": "computer.fields.my_cpu_type.title",
          "description": "The name of a document in ERP5",
          "description_i18n": "computer.fields.my_cpu_type.desc",
          "default": null,
          "css_class": null,
          "hidden": false,
          "size": 1,
          "items": "getComputerCPUType",
          "select_first_item": true,
          "extra_per_item": null,
          "extra": null
        },
        "validator": {
          "enabled": true,
          "editable": true,
          "external_validator": null,
          "required": null,
          "preserve_whitespace": null,
          "unicode": null
        },
        "messages": {
          "external_validator_failed": {
            "message": "The input failed the external validator.",
            "i18n": "generic.errors.fields.my_title.validator"
          },
          "required_not_found": {
            "message": "Input is required but no input given.",
            "i18n": "generic.errors.common.no_input"
          },
          "unknown_selection": {
            "message":"You selected on option not on the menu",
            "i18n": "generic.errors.common.unkown_item"
          }
        }
      },
      "my_memory_size": {
        "type": "ListField",
        "widget": {
          "id": "my_memory_size",
          "alternate_name": "my_memory_size",
          "title": "Memory Size",
          "title_i18n": "computer.fields.my_memory_size.title",
          "description": "The name of a document in ERP5",
          "description_i18n": "computer.fields.my_memory_size.desc",
          "default": null,
          "css_class": null,
          "hidden": false,
          "size": 1,
          "items": "getComputerMemorySize",
          "select_first_item": true,
          "extra_per_item": null,
          "extra": null
        },
        "validator": {
          "enabled": true,
          "editable": true,
          "external_validator": null,
          "required": null,
          "preserve_whitespace": null,
          "unicode": null
        },
        "messages": {
          "external_validator_failed": {
            "message": "The input failed the external validator.",
            "i18n": "generic.errors.fields.my_title.validator"
          },
          "required_not_found": {
            "message": "Input is required but no input given.",
            "i18n": "generic.errors.common.no_input"
          },
          "unknown_selection": {
            "message":"You selected on option not on the menu",
            "i18n": "generic.errors.common.unkown_item"
          }
        }
      },
      "my_memory_type": {
        "type": "ListField",
        "widget": {
          "id": "my_memory_type",
          "alternate_name": "my_memory_type",
          "title": "Memory Type",
          "title_i18n": "computer.fields.my_memory_type.title",
          "description": "The name of a document in ERP5",
          "description_i18n": "computer.fields.my_memory_type.desc",
          "default": null,
          "css_class": null,
          "hidden": false,
          "size": 1,
          "items": "getComputerMemoryType",
          "select_first_item": true,
          "extra_per_item": null,
          "extra": null
        },
        "validator": {
          "enabled": true,
          "editable": true,
          "external_validator": null,
          "required": null,
          "preserve_whitespace": null,
          "unicode": null
        },
        "messages": {
          "external_validator_failed": {
            "message": "The input failed the external validator.",
            "i18n": "generic.errors.fields.my_title.validator"
          },
          "required_not_found": {
            "message": "Input is required but no input given.",
            "i18n": "generic.errors.common.no_input"
          },
          "unknown_selection": {
            "message":"You selected on option not on the menu",
            "i18n": "generic.errors.common.unkown_item"
          }
        }
      },
      "my_region": {
        "type": "ListField",
        "widget": {
          "id": "my_region",
          "alternate_name": "my_region",
          "title": "Region",
          "title_i18n": "computer.fields.my_region.title",
          "description": "The name of a document in ERP5",
          "description_i18n": "computer.fields.my_region.desc",
          "default": null,
          "css_class": null,
          "hidden": false,
          "size": 1,
          "items": "getComputerRegion",
          "select_first_item": true,
          "extra_per_item": null,
          "extra": null
        },
        "validator": {
          "enabled": true,
          "editable": true,
          "external_validator": null,
          "required": null,
          "preserve_whitespace": null,
          "unicode": null
        },
        "messages": {
          "external_validator_failed": {
            "message": "The input failed the external validator.",
            "i18n": "generic.errors.fields.my_title.validator"
          },
          "required_not_found": {
            "message": "Input is required but no input given.",
            "i18n": "generic.errors.common.no_input"
          },
          "unknown_selection": {
            "message":"You selected on option not on the menu",
            "i18n": "generic.errors.common.unkown_item"
          }
        }
      },
      "my_storage_capacity": {
        "type": "ListField",
        "widget": {
          "id": "my_storage_capacity",
          "alternate_name": "my_storage_capacity",
          "title": "Storage Capacity",
          "title_i18n": "computer.fields.my_storage_capacity.title",
          "description": "The name of a document in ERP5",
          "description_i18n": "computer.fields.my_storage_capacity.desc",
          "default": null,
          "css_class": null,
          "hidden": false,
          "size": 1,
          "items": "getComputerStorageCapacity",
          "select_first_item": true,
          "extra_per_item": null,
          "extra": null
        },
        "validator": {
          "enabled": true,
          "editable": true,
          "external_validator": null,
          "required": null,
          "preserve_whitespace": null,
          "unicode": null
        },
        "messages": {
          "external_validator_failed": {
            "message": "The input failed the external validator.",
            "i18n": "generic.errors.fields.my_title.validator"
          },
          "required_not_found": {
            "message": "Input is required but no input given.",
            "i18n": "generic.errors.common.no_input"
          },
          "unknown_selection": {
            "message":"You selected on option not on the menu",
            "i18n": "generic.errors.common.unkown_item"
          }
        }
      },
      "my_storage_interface": {
        "type": "ListField",
        "widget": {
          "id": "my_storage_interface",
          "alternate_name": "my_storage_interface",
          "title": "Storage Interface",
          "title_i18n": "computer.fields.my_storage_interface.title",
          "description": "The name of a document in ERP5",
          "description_i18n": "computer.fields.my_storage_interface.desc",
          "default": null,
          "css_class": null,
          "hidden": false,
          "size": 1,
          "items": "getComputerStorageInterface",
          "select_first_item": true,
          "extra_per_item": null,
          "extra": null
        },
        "validator": {
          "enabled": true,
          "editable": true,
          "external_validator": null,
          "required": null,
          "preserve_whitespace": null,
          "unicode": null
        },
        "messages": {
          "external_validator_failed": {
            "message": "The input failed the external validator.",
            "i18n": "generic.errors.fields.my_title.validator"
          },
          "required_not_found": {
            "message": "Input is required but no input given.",
            "i18n": "generic.errors.common.no_input"
          },
          "unknown_selection": {
            "message":"You selected on option not on the menu",
            "i18n": "generic.errors.common.unkown_item"
          }
        }
      },
      "my_storage_redundancy": {
        "type": "ListField",
        "widget": {
          "id": "my_storage_redundancy",
          "alternate_name": "my_storage_redundancy",
          "title": "Storage Redundancy",
          "title_i18n": "computer.fields.my_storage_redundancy.title",
          "description": "The name of a document in ERP5",
          "description_i18n": "computer.fields.my_storage_redundancy.desc",
          "default": null,
          "css_class": null,
          "hidden": false,
          "size": 1,
          "items": "getComputerStorageRedundancy",
          "select_first_item": true,
          "extra_per_item": null,
          "extra": null
        },
        "validator": {
          "enabled": true,
          "editable": true,
          "external_validator": null,
          "required": null,
          "preserve_whitespace": null,
          "unicode": null
        },
        "messages": {
          "external_validator_failed": {
            "message": "The input failed the external validator.",
            "i18n": "generic.errors.fields.my_title.validator"
          },
          "required_not_found": {
            "message": "Input is required but no input given.",
            "i18n": "generic.errors.common.no_input"
          },
          "unknown_selection": {
            "message":"You selected on option not on the menu",
            "i18n": "generic.errors.common.unkown_item"
          }
        }
      },
      "my_wide_area_network_type": {
        "type": "ListField",
        "widget": {
          "id": "my_wide_area_network_type",
          "alternate_name": "my_wide_area_network_type",
          "title": "Network Type",
          "title_i18n": "computer.fields.my_wide_area_network_type.title",
          "description": "The name of a document in ERP5",
          "description_i18n": "computer.fields.my_wide_area_network_type.desc",
          "default": null,
          "css_class": null,
          "hidden": false,
          "size": 1,
          "items": "getComputerNetwork",
          "select_first_item": true,
          "extra_per_item": null,
          "extra": null
        },
        "validator": {
          "enabled": true,
          "editable": true,
          "external_validator": null,
          "required": null,
          "preserve_whitespace": null,
          "unicode": null
        },
        "messages": {
          "external_validator_failed": {
            "message": "The input failed the external validator.",
            "i18n": "generic.errors.fields.my_title.validator"
          },
          "required_not_found": {
            "message": "Input is required but no input given.",
            "i18n": "generic.errors.common.no_input"
          },
          "unknown_selection": {
            "message":"You selected on option not on the menu",
            "i18n": "generic.errors.common.unkown_item"
          }
        }
      },
      "my_local_area_network_type": {
        "type": "ListField",
        "widget": {
          "id": "my_local_area_network_type",
          "alternate_name": "my_local_area_network_type",
          "title": "Local Area Network Type",
          "title_i18n": "computer.fields.my_local_area_network_type.title",
          "description": "The name of a document in ERP5",
          "description_i18n": "computer.fields.my_local_area_network_type.desc",
          "default": null,
          "css_class": null,
          "hidden": false,
          "size": 1,
          "items": "getComputerLANType",
          "select_first_item": true,
          "extra_per_item": null,
          "extra": null
        },
        "validator": {
          "enabled": true,
          "editable": true,
          "external_validator": null,
          "required": null,
          "preserve_whitespace": null,
          "unicode": null
        },
        "messages": {
          "external_validator_failed": {
            "message": "The input failed the external validator.",
            "i18n": "generic.errors.fields.my_title.validator"
          },
          "required_not_found": {
            "message": "Input is required but no input given.",
            "i18n": "generic.errors.common.no_input"
          },
          "unknown_selection": {
            "message":"You selected on option not on the menu",
            "i18n": "generic.errors.common.unkown_item"
          }
        }
      },
      "my_storage_technology": {
        "type": "ListField",
        "widget": {
          "id": "my_storage_technology",
          "alternate_name": "my_storage_technology",
          "title": "Storage Technology",
          "title_i18n": "computer.fields.my_storage_technology.title",
          "description": "The name of a document in ERP5",
          "description_i18n": "computer.fields.my_storage_technology.desc",
          "default": null,
          "css_class": null,
          "hidden": false,
          "size": 1,
          "items": "getStorageTechnology",
          "select_first_item": true,
          "extra_per_item": null,
          "extra": null
        },
        "validator": {
          "enabled": true,
          "editable": true,
          "external_validator": null,
          "required": null,
          "preserve_whitespace": null,
          "unicode": null
        },
        "messages": {
          "external_validator_failed": {
            "message": "The input failed the external validator.",
            "i18n": "generic.errors.fields.my_title.validator"
          },
          "required_not_found": {
            "message": "Input is required but no input given.",
            "i18n": "generic.errors.common.no_input"
          },
          "unknown_selection": {
            "message":"You selected on option not on the menu",
            "i18n": "generic.errors.common.unkown_item"
          }
        }
      },
      "my_description": {
        "type": "TextareaField",
        "widget": {
          "id": "my_group",
          "alternate_name": "my_group",
          "title": "Description",
          "title_i18n": "computer.fields.my_group.title",
          "description": "The name of a document in ERP5",
          "description_i18n": "computer.fields.my_group.desc",
          "default": null,
          "css_class": null,
          "hidden": false,
          "width": 100,
          "height": 10
        },
        "validator": {
          "enabled": true,
          "editable": true,
          "external_validator": null,
          "required": null,
          "preserve_whitespace": null,
          "unicode": null,
          "maximum_lines": null,
          "maximum_length_of_line": null,
          "maximum_length": null
        },
        "messages": {
          "external_validator_failed": {
            "message": "The input failed the external validator.",
            "i18n": "generic.errors.fields.my_title.validator"
          },
          "required_not_found": {
            "message": "Input is required but no input given.",
            "i18n": "generic.errors.common.no_input"
          },
          "too_many_lines": {
            "message":"You entered too many lines",
            "i18n": "generic.errors.common.lines_overflow"
          },
          "line_too_long": {
            "message": "A line was too long",
            "i18n": "generic.errors.common.line_overflow"
          },
          "too_long": {
            "message": "You entered too many characters",
            "i18n": "generic.errors.common.character_overflow"
          }
        }
      },
      "my_translated_validation_state_title": {
        "type": "StringField",
        "widget": {
          "id": "my_translated_validation_state_title",
          "alternate_name": "my_translated_validation_state_title",
          "title": "Validation State",
          "title_i18n": "computer.fields.my_translated_validation_state_title.title",
          "description": "The name of a document in ERP5",
          "description_i18n": "computer.fields.my_translated_validation_state_title.desc",
          "default": null,
          "css_class": null,
          "hidden": false,
          "display_width": 30,
          "maximum_input": null,
          "extra": {"data-clear-btn":"true"}
        },
        "validator": {
          "enabled": true,
          "editable": true,
          "external_validator": null,
          "required": null,
          "preserve_whitespace": null,
          "unicode": null,
          "maximum_length": null,
          "truncate": null
        },
        "messages": {
          "external_validator_failed": {
            "message": "The input failed the external validator.",
            "i18n": "generic.errors.fields.my_title.validator"
          },
          "required_not_found": {
            "message": "Input is required but no input given.",
            "i18n": "generic.errors.common.no_input"
          },
          "too_long": {
            "message":"Too much input was given.",
            "i18n": "generic.errors.common.too_long"
          }
        }
      },
      "my_default_network_address_netmask": {
        "type": "StringField",
        "widget": {
          "id": "my_default_network_address_netmask",
          "alternate_name": "my_default_network_address_netmask",
          "title": "Netmask",
          "title_i18n": "computer.fields.my_default_network_address_netmask.title",
          "description": "The name of a document in ERP5",
          "description_i18n": "computer.fields.my_default_network_address_netmask.desc",
          "default": null,
          "css_class": null,
          "hidden": false,
          "display_width": 30,
          "maximum_input": null,
          "extra": {"data-clear-btn":"true"}
        },
        "validator": {
          "enabled": true,
          "editable": true,
          "external_validator": null,
          "required": null,
          "preserve_whitespace": null,
          "unicode": null,
          "maximum_length": null,
          "truncate": null
        },
        "messages": {
          "external_validator_failed": {
            "message": "The input failed the external validator.",
            "i18n": "generic.errors.fields.my_title.validator"
          },
          "required_not_found": {
            "message": "Input is required but no input given.",
            "i18n": "generic.errors.common.no_input"
          },
          "too_long": {
            "message":"Too much input was given.",
            "i18n": "generic.errors.common.too_long"
          }
        }
      },
      "my_default_network_address_ip_address": {
        "type": "StringField",
        "widget": {
          "id": "my_default_network_address_ip_address",
          "alternate_name": "my_default_network_address_ip_address",
          "title": "IP Address",
          "title_i18n": "computer.fields.my_default_network_address_ip_address.title",
          "description": "The name of a document in ERP5",
          "description_i18n": "computer.fields.my_default_network_address_ip_address.desc",
          "default": null,
          "css_class": null,
          "hidden": false,
          "display_width": 30,
          "maximum_input": null,
          "extra": {"data-clear-btn":"true"}
        },
        "validator": {
          "enabled": true,
          "editable": true,
          "external_validator": null,
          "required": null,
          "preserve_whitespace": null,
          "unicode": null,
          "maximum_length": null,
          "truncate": null
        },
        "messages": {
          "external_validator_failed": {
            "message": "The input failed the external validator.",
            "i18n": "generic.errors.fields.my_title.validator"
          },
          "required_not_found": {
            "message": "Input is required but no input given.",
            "i18n": "generic.errors.common.no_input"
          },
          "too_long": {
            "message":"Too much input was given.",
            "i18n": "generic.errors.common.too_long"
          }
        }
      },
      "my_default_network_address_host_name": {
        "type": "StringField",
        "widget": {
          "id": "my_default_network_address_host_name",
          "alternate_name": "my_default_network_address_host_name",
          "title": "Hostname",
          "title_i18n": "computer.fields.my_default_network_address_host_name.title",
          "description": "The name of a document in ERP5",
          "description_i18n": "computer.fields.my_default_network_address_host_name.desc",
          "default": null,
          "css_class": null,
          "hidden": false,
          "display_width": 30,
          "maximum_input": null,
          "extra": {"data-clear-btn":"true"}
        },
        "validator": {
          "enabled": true,
          "editable": true,
          "external_validator": null,
          "required": null,
          "preserve_whitespace": null,
          "unicode": null,
          "maximum_length": null,
          "truncate": null
        },
        "messages": {
          "external_validator_failed": {
            "message": "The input failed the external validator.",
            "i18n": "generic.errors.fields.my_title.validator"
          },
          "required_not_found": {
            "message": "Input is required but no input given.",
            "i18n": "generic.errors.common.no_input"
          },
          "too_long": {
            "message":"Too much input was given.",
            "i18n": "generic.errors.common.too_long"
          }
        }
      },
      "my_quantity": {
        "type": "IntegerField",
        "widget": {
          "id": "my_quantity",
          "alternate_name": "my_quantity",
          "title": "Number of Computer Partitions",
          "title_i18n": "computer.fields.my_quantity.title",
          "description": "The name of a document in ERP5",
          "description_i18n": "computer.fields.my_quantity.desc",
          "default": undefined,
          "css_class": undefined,
          "hidden": false,
          "display_width": 5,
          "maximum_input": undefined,
          "extra": {"data-clear-btn":"true"}
        },
        "validator": {
          "enabled": true,
          "editable": true,
          "external_validator": undefined,
          "required": undefined,
          "preserve_whitespace": undefined,
          "truncate": undefined,
          "start": undefined,
          "end": undefined
        },
        "messages": {
          "external_validator_failed": {
            "message": "The input failed the external validator.",
            "i18n": "generic.errors.fields.my_title.validator"
          },
          "required_not_found": {
            "message": "Input is required but no input given.",
            "i18n": "generic.errors.common.no_input"
          },
          "not_integer": {
            "message":"You did not enter an integer.",
            "i18n": "generic.errors.common.no_integer"
          },
          "integer_out_of_range":  {
            "message":"The integer you entered is out of range.",
            "i18n": "generic.errors.common.integer_out_of_range"
          }
        }
      },
      "my_specialize_title": {
        "type": "RelationStringField",
        "widget": {
          "id": "my_specialize_title",
          "alternate_name": "my_specialize_title",
          "title": "Computer Model",
          "title_i18n": "computer.fields.my_specialize_title.title",
          "description": "The name of a document in ERP5",
          "description_i18n": "computer.fields.my_specialize_title.desc",
          "default": undefined,
          "css_class": undefined,
          "hidden": false,
          "width": 20,
          "extra": {
            "data-clear-btn":"true",
            "data-action-btn":"true",
            "data-action-btn-icon": "plane",
            "data-action-btn-text": "Jump",
            "data-reference": "relation",
            "data-action-btn-pop": "true",
            "data-action-btn-pop-id": "relation",
            "data-action-btn-class": "ui-disabled"
          },
          "update_method": undefined,
          "jump_method": undefined,
          "allow_jump": true,
          "base_category": undefined,
          "portal_type": "Computer Model",
          "allow_creation": true,
          "container_getter_method": undefined,
          "context_getter_method": undefined,
          "catalog_index": undefined,
          "relation_update_method": undefined,
          "relation_form": undefined,
          "columns": undefined,
          "default_list": undefined,
          "parameter_list": undefined,
          "list_method": undefined,
          "select_first_item": undefined,
          "items": undefined,
          "proxy_listbox_ids": undefined,
          "size": undefined,
          "extra_per_item": undefined
        },
        "validator": {
          "enabled": true,
          "editable": true,
          "external_validator": undefined,
          "required": undefined,
          "preserver_whitespace": undefined,
          "unicode": undefined,
          "maximum_lenght": undefined,
          "truncate": undefined,
          "maximum_lines": undefined,
          "maximum_length_of_line": undefined
        }
      }
    }
  };

  /* ====================================================================== */
  /*                          GADGET Configuration                          */
  /* ====================================================================== */
  // Everything loosely definable as a gadget...
  priv.gadget_properties = {

    /* ******************************************************************** */
    /*                            Global Popup                              */
    /* ******************************************************************** */
    "application_popup": {
      "id" :"global_popup",
      "transition": "fade",
      "shadow": "true",
      "classes": "popup single ui-content",
      "theme": "slapos-white",
      "position": "window",
      "tolerance": "30,30,30,30",
      "overlay_theme": "slapos-black"
    },
    /* ******************************************************************** */
    /*                            Global Header                             */
    /* ******************************************************************** */
    // NOTE: title is set by the respective page configuration
    "application_header": {
      "id": "global_header",
      "class": undefined,
      "transition":"slidedown",
      "title": undefined,
      "title_i18n": undefined,
      "fixed": true,
      "global": true,
      "theme": "slapos-white",
      "controls": [{
        "type": "controlgroup",
        "direction": "horizontal",
        "class": "",
        "controls_class": "",
        "buttons": [{
          "type":"a",
          "options": {"href": "#menu", "className":"responsive ui-link ui-first-child ui-last-child ui-btn ui-icon-reorder ui-btn-icon-left ui-shadow ui-corner-all"},
          "attributes": {"data-rel":"panel", "data-enhanced":"true", "data-icon":"reorder", "data-i18n":"", "data-iconpos":"left", "data-role":"button"},
          "setters": {"text":"Navigate"}
          }]
        },{
          "type": "controlgroup",
          "direction": "horizontal",
          "class": "",
          "controls_class": "",
          "buttons": [{
            "type":"a",
            "options": {"href": "#global_popup", "className":"responsive toggle_global_popup ui-link ui-first-child ui-last-child ui-btn ui-icon-user ui-btn-icon-left ui-shadow ui-corner-all"},
            "attributes": {"data-rel":"popup", "data-reference":"login", "data-enhanced":"true", "data-transition":"pop", "data-position-to":"window", "data-icon":"user", "data-iconpos":"left", "data-i18n":""},
            "setters": {"text":"Login"}
          }]
        }
      ]
    },
    /* ******************************************************************** */
    /*                            Global Footer                             */
    /* ******************************************************************** */
    "application_footer": {
      "id": "global_footer",
      "class": undefined,
      "transition":"slidedown",
      "type": "navbar",
      "type_class":"",
      "fixed": true,
      "global": true,
      "theme": "slapos-white",
      "buttons": [
          {
            "type":"a",
            "options": {"href": "", "className":"translate toggle_global_popup ui-link ui-btn ui-icon-compass ui-btn-icon-top"},
            "attributes": {"data-rel":"popup", "data-reference":"browse", "data-enhanced":"true", "data-transition":"pop", "data-position-to":"window", "data-icon":"compass", "data-iconpos":"top", "data-i18n":""},
            "setters": {"text":"Browse"}
          }, {
            "type":"a",
            "options": {"href": "", "className":"new_item translate ui-link ui-btn ui-icon-plus ui-btn-icon-top"},
            "attributes": {"data-enhanced":"true", "data-icon":"plus", "data-iconpos":"top", "data-i18n":""},
            "setters": {"text":"Add"}
          }, {
            "type":"a",
            "options": {"href": "", "className":"remove_item translate ui-link ui-btn ui-icon-minus ui-btn-icon-top"},
            "attributes": {"data-enhanced":"true", "data-icon":"minus", "data-iconpos":"top", "data-i18n":""},
            "setters": {"text":"Remove"}
          }, {
            "type":"a",
            "options": {"href": "", "className":"translate toggle_global_popup ui-link ui-btn ui-icon-cog ui-btn-icon-top"},
            "attributes": {"data-rel":"popup", "data-reference":"action", "data-enhanced":"true", "data-transition":"pop", "data-position-to":"window", "data-icon":"cog", "data-iconpos":"top", "data-i18n":""},
            "setters": {"text":"Action"}
          }, {
            "type":"a",
            "options": {"href": "", "className":"translate toggle_global_popup ui-link ui-btn ui-icon-share ui-btn-icon-top"},
            "attributes": {"data-rel":"popup", "data-reference":"export", "data-enhanced":"true", "data-transition":"pop", "data-position-to":"window", "data-icon":"share", "data-iconpos":"top", "data-i18n":""},
            "setters": {"text":"Export"}
          }
      ]
    },
    /* ******************************************************************** */
    /*                            Global Panel                              */
    /* ******************************************************************** */
    // TODO: API is crap. Refactor
    "application_menu": {
        "theme": "slapos-black",
        "elements": [
            {
                "type": "globalsearch",
                "theme": "slapos-black"
            },
            {
                "type": "listmenu",
                "theme": "slapos-black",
                "role": "listview",
                "class": undefined,
                "items": [
                    {
                        "type": "divider",
                        "text": "Account",
                        "text_i18n": undefined
                    },
                    {
                        "type": "item",
                        "left": {
                            "img": undefined,
                            "icon": "user"
                        },
                        "middle": {
                            "href": "simulation.html",
                            "href_title": undefined,
                            "href_i18n": undefined,
                            "title": "Simulation",
                            "title_i18n": undefined,
                            "subtitle": "Simulation Overview",
                            "subtitle_i18n": undefined,
                            "info": undefined,
                            "info_i18n": undefined
                        },
                        "aside": undefined,
                        "right": undefined,
                        "split": undefined
                    },
                    {
                        "type": "item",
                        "left": {
                            "img": undefined,
                            "icon": "file-text-alt"
                        },
                        "middle": {
                            "href": "file_list.html",
                            "href_title": undefined,
                            "href_i18n": undefined,
                            "title": "Files",
                            "title_i18n": undefined,
                            "subtitle": "Open File",
                            "subtitle_i18n": undefined,
                            "info": undefined,
                            "info_i18n": undefined
                        },
                        "aside": undefined,
                        "right": undefined,
                        "split": undefined
                    },
                    {
                        "type": "item",
                        "left": {
                            "img": undefined,
                            "icon": "hdd"
                        },
                        "middle": {
                            "href": "servers.html",
                            "href_title": undefined,
                            "href_i18n": undefined,
                            "title": "Servers",
                            "title_i18n": undefined,
                            "subtitle": "Server Instances being used",
                            "subtitle_i18n": undefined,
                            "info": undefined,
                            "info_i18n": undefined
                        },
                        "aside": undefined,
                        "right": undefined,
                        "split": undefined
                    },
                    {
                        "type": "item",
                        "left": {
                            "img": undefined,
                            "icon": "cogs"
                        },
                        "middle": {
                            "href": "services.html",
                            "href_title": undefined,
                            "href_i18n": undefined,
                            "title": "Services",
                            "title_i18n": undefined,
                            "subtitle": "Installed Software Administration",
                            "subtitle_i18n": undefined,
                            "info": undefined,
                            "info_i18n": undefined
                        },
                        "aside": undefined,
                        "right": undefined,
                        "split": undefined
                    },
                    {
                        "type": "item",
                        "left": {
                            "img": undefined,
                            "icon": "sitemap"
                        },
                        "middle": {
                            "href": "networks.html",
                            "href_title": undefined,
                            "href_i18n": undefined,
                            "title": "Networks",
                            "title_i18n": undefined,
                            "subtitle": "Network Administration",
                            "subtitle_i18n": undefined,
                            "info": undefined,
                            "info_i18n": undefined
                        },
                        "aside": undefined,
                        "right": undefined,
                        "split": undefined
                    },
                    {
                        "type": "divider",
                        "text": "Performance",
                        "text_i18n": undefined
                    },
                    {
                        "type": "item",
                        "left": {
                            "img": undefined,
                            "icon": "bar-chart"
                        },
                        "middle": {
                            "href": "monitoring.html",
                            "href_title": undefined,
                            "href_i18n": undefined,
                            "title": "Monitoring",
                            "title_i18n": undefined,
                            "subtitle": "Server Status Reports",
                            "subtitle_i18n": undefined,
                            "info": undefined,
                            "info_i18n": undefined
                        },
                        "aside": undefined,
                        "right": undefined,
                        "split": undefined
                    },
                    {
                        "type": "divider",
                        "text": "Support",
                        "text_i18n": ""
                    },
                    {
                        "type": "item",
                        "left": {
                            "img": undefined,
                            "icon": "question-sign"
                        },
                        "middle": {
                            "href": "help.html",
                            "href_title": undefined,
                            "href_i18n": undefined,
                            "title": "Help",
                            "title_i18n": undefined,
                            "subtitle": "Contact Customer Support",
                            "subtitle_i18n": undefined,
                            "info": undefined,
                            "info_i18n": undefined
                        },
                        "aside": undefined,
                        "right": undefined,
                        "split": undefined
                    }
                ]
            },
            {
                "type": "listmenu",
                "theme": "slapos-black",
                "class": undefined,
                "role":"listview",
                "items": [
                    {
                        "type": "divider",
                        "text": "General",
                        "text_i18n": undefined
                    },
                    {
                        "type": "item",
                        "left": {
                            "img": undefined,
                            "icon": "folder-open-alt"
                        },
                        "middle": {
                            "href": "software.html",
                            "href_title": undefined,
                            "href_i18n": undefined,
                            "title": "Software",
                            "title_i18n": "",
                            "subtitle": undefined,
                            "subtitle_i18n": undefined,
                            "info": undefined,
                            "info_i18n": undefined
                        },
                        "aside": undefined,
                        "right": undefined,
                        "split": undefined
                    },
                    {
                        "type": "item",
                        "left": {
                            "img": undefined,
                            "icon": "book"
                        },
                        "middle": {
                            "href": "wiki.html",
                            "href_title": undefined,
                            "href_i18n": undefined,
                            "title": "Documentation",
                            "title_i18n": "",
                            "subtitle": undefined,
                            "subtitle_i18n": undefined,
                            "info": undefined,
                            "info_i18n": undefined
                        },
                        "aside": undefined,
                        "right": undefined,
                        "split": undefined
                    },
                    {
                        "type": "item",
                        "left": {
                            "img": undefined,
                            "icon": "download"
                        },
                        "middle": {
                            "href": "download.html",
                            "href_title": undefined,
                            "href_i18n": undefined,
                            "title": "Download",
                            "title_i18n": "",
                            "subtitle": undefined,
                            "subtitle_i18n": undefined,
                            "info": undefined,
                            "info_i18n": undefined
                        },
                        "aside": undefined,
                        "right": undefined,
                        "split": undefined
                    },
                    {
                        "type": "item",
                        "left": {
                            "img": undefined,
                            "icon": "comments"
                        },
                        "middle": {
                            "href": "forum.html",
                            "href_title": undefined,
                            "href_i18n": undefined,
                            "title": "Forum",
                            "title_i18n": "",
                            "subtitle": undefined,
                            "subtitle_i18n": undefined,
                            "info": undefined,
                            "info_i18n": undefined
                        },
                        "aside": undefined,
                        "right": undefined,
                        "split": undefined
                    },
                    {
                        "type": "item",
                        "left": {
                            "img": undefined,
                            "icon": "microphone"
                        },
                        "middle": {
                            "href": "blog.html",
                            "href_title": undefined,
                            "href_i18n": undefined,
                            "title": "Blog",
                            "title_i18n": "",
                            "subtitle": undefined,
                            "subtitle_i18n": undefined,
                            "info": undefined,
                            "info_i18n": undefined
                        },
                        "aside": undefined,
                        "right": undefined,
                        "split": undefined
                    },
                    {
                        "left": {
                            "img": undefined,
                            "icon": "euro"
                        },
                        "middle": {
                            "href": "pricing.html",
                            "href_title": undefined,
                            "href_i18n": undefined,
                            "title": "Pricing",
                            "title_i18n": "",
                            "subtitle": undefined,
                            "subtitle_i18n": undefined,
                            "info": undefined,
                            "info_i18n": undefined
                        },
                        "aside": undefined,
                        "right": undefined,
                        "split": undefined
                    }
                ]
            },
            {
                "type": "listmenu",
                "role": undefined,
                "class": "list mini ",
                "theme":undefined,
                "items": [{
                    "type": "item",
                    "middle": {
                      "href":"http://nexedi.com/",
                      "href_title": undefined,
                      "href_i18n": undefined,
                      "info": "Nexedi 2013",
                      "info_i18n": undefined
                    }
                  }
                ]
            }
        ]
    },

    /* ==================================================================== */
    /*                          Content Gadgets                             */
    /* ==================================================================== */
    /* ******************************************************************** */
    /*                            network_actions                           */
    /* ******************************************************************** */
    "network_actions": {
      "datasource": "Computer Networks",
      "portal_type_title": "networks",
      "layout": {
        "type": "controlgroup",
        "direction": "horizontal",
        "class": "action_menu center ",
        "controls_class": "",
        "buttons": [{
          "type": "a",
          "options": {
            "href": "object.html?type=networks&mode=new",
            "className": "translate action_new ui-link ui-btn ui-btn-inline ui-shadow ui-corner-all ui-icon-sitemap ui-btn-active ui-corner-all ui-btn-icon-left ui-first-child ui-last-child"
          },
          "attributes": {
            "data-type": "networks",
            "data-role":"button",
            "data-icon":"sitemap",
            "data-i18n":"",
            "data-iconpos":"left"
          },
          "setters": {"text": "Add Network"}
        }]
      }
    },
    /* ******************************************************************** */
    /*                            service_actions                           */
    /* ******************************************************************** */
    "service_actions": {
      "datasource": "Hosting Subscriptions",
      "portal_type_title": "services",
      "layout": {
        "type": "controlgroup",
        "direction": "horizontal",
        "class": "action_menu center ",
        "controls_class": "",
        "buttons": [{
          "type": "a",
          "options": {
            "href": "software.html",
            "className": "translate action_new ui-link ui-btn ui-btn-inline ui-shadow ui-corner-all ui-icon-cogs ui-btn-active ui-corner-all ui-btn-icon-left ui-first-child ui-last-child"
          },
          "attributes": {
            "data-type": "services",
            "data-role":"button",
            "data-icon":"cogs",
            "data-i18n":"",
            "data-iconpos":"left"
          },
          "setters": {"text": "Add Software"}
        }]
      }
    },
     /* ******************************************************************** */
    /*                            account actions                           */
    /* ******************************************************************** */
    "account_actions": {
      "datasource": "Persons",
      "portal_type_title": "account",
      "layout": {
        "type": "controlgroup",
        "direction": "vertical",
        "class": "action_menu center ",
        "controls_class": "",
        "buttons": [{
          "type": "a",
          "options": {
            "href": "",
            "className": "translate action_new ui-link ui-btn ui-shadow ui-corner-all ui-icon-lock ui-btn-active ui-corner-all ui-btn-icon-left ui-first-child"
          },
          "attributes": {
            "data-type": "person",
            "data-action": "request_ssl",
            "data-role":"button",
            "data-icon":"lock",
            "data-i18n":"",
            "data-iconpos":"left"
          },
          "setters": {"text": "Request SSL Certificate"}
        },{
          "type": "a",
          "options": {
            "href": "",
            "className": "translate action_new ui-link ui-btn ui-shadow ui-corner-all ui-icon-unlock ui-btn-active ui-corner-all ui-btn-icon-left"
          },
          "attributes": {
            "data-type": "person",
            "data-action": "revoke_ssl",
            "data-role":"button",
            "data-icon":"unlock",
            "data-i18n":"",
            "data-iconpos":"left"
          },
          "setters": {"text": "Revoke SSL Certificate"}
        },{
          "type": "a",
          "options": {
            "href": "",
            "className": "translate action_new ui-link ui-btn ui-shadow ui-corner-all ui-icon-lock ui-btn-active ui-corner-all ui-btn-icon-left"
          },
          "attributes": {
            "data-type": "person",
            "data-action": "request_computer_token",
            "data-role":"button",
            "data-icon":"lock",
            "data-i18n":"",
            "data-iconpos":"left"
          },
          "setters": {"text": "Computer Security Token"}
        },{
          "type": "a",
          "options": {
            "href": "",
            "className": "translate action_new ui-link ui-btn ui-shadow ui-corner-all ui-icon-lock ui-btn-active ui-corner-all ui-btn-icon-left ui-last-child"
          },
          "attributes": {
            "data-type": "person",
            "data-action": "request_credential_token",
            "data-role":"button",
            "data-icon":"lock",
            "data-i18n":"",
            "data-iconpos":"left"
          },
          "setters": {"text": "Credential Security Token"}
        }]
      }
    },
    /* ******************************************************************** */
    /*                            computer_actions                          */
    /* ******************************************************************** */
    "computer_actions": {
      "datasource": "Computers",
      "portal_type_title": "computer",
      "layout": {
        "type": "controlgroup",
        "direction": "horizontal",
        "class": "action_menu center ",
        "controls_class": "",
        "buttons": [{
          "type": "a",
          "options": {
            "href": "object.html?type=computers&mode=new",
            "className": "translate action_new ui-link ui-btn ui-btn-inline ui-shadow ui-corner-all ui-icon-hdd ui-btn-active ui-corner-all ui-btn-icon-left ui-first-child ui-last-child"
          },
          "attributes": {
            "data-type": "computers",
            "data-role":"button",
            "data-icon":"hdd",
            "data-i18n":"",
            "data-iconpos":"left"
          },
          "setters": {"text": "Add Computer"}
        }]
      }
    },
    /* ******************************************************************** */
    /*                            Account_01                                */
    /* ******************************************************************** */

    /* ******************************************************************** */
    /*                            Services_01                               */
    /* ******************************************************************** */
    "services_01": {
      "datasource": "Hosting Subscriptions",
      "portal_type_title":"services",
      "layout": {
        "type": "table",
        "direct": {
          "id": "services_1",
          "className":"table-stroke ui-responsive"
        },
        "attributes": {
          "data-role": "table",
          "data-mode": "columntoggle",
          "data-use-pop": false,
          "data-enhanced": false,
          "data-column-btn-show": false,
          "data-column-btn-icon": "expand-alt",
          "data-column-btn-theme": "slapos-white",
          "data-column-btn-text": "Toggle",
          "data-wrap": "both",
          "data-top-grid": 1,
          "data-bottom-grid": 1,
          "data-sorting": "true"
        }
      },
      "configuration": {
        "global_search":    { "show": true, "search_field_reference_id": "global_computer_networks"},
        "group_search":     { "show": false },
        "detail_search":    { "show": false },
        "configure_search": { "show": false },
        "pagination":       { "show": false },
        "record_info":      { "show": false },
        "select_info":      { "show": false },
        "checkbox":         { "show": false },
        "sorting":          { "show": false },
        //"editable":       { "show": false },
        //"lazyload":       { "show": false },
        "link_to_records":  { "show": false },
        "build_to_merge":   { "show": false },
        "caption":          { "show": false }
        //"caption":          { "show": true, "slot":1, "title": "Paiements à Venir", "title_i18n":""}
      },
      "view": [
        {"title": "_id", "show": false, "priority": 5 },
        {"title": "my_title", "show": true, "persist":"true"},
        {"title": "image", "show": true, "persist": true, "image": true}
      ],
      "actions": []
    },
    /* ******************************************************************** */
    /*                            Computer_01                               */
    /* ******************************************************************** */
    "computer_01": {
      "datasource": "Computer",
      "portal_type_title": "computer",
      "layout": {
        "type": "table",
        "direct": {
          "id": "computer_1",
          "className":"table-stroke ui-responsive"
        },
        "attributes": {
          "data-role": "table",
          "data-mode": "columntoggle",
          "data-use-pop": false,
          "data-enhanced": false,
          "data-column-btn-show": false,
          "data-column-btn-icon": "expand-alt",
          "data-column-btn-theme": "slapos-white",
          "data-column-btn-text": "Toggle",
          "data-wrap": "both",
          "data-top-grid": 1,
          "data-bottom-grid": 1,
          "data-sorting": "true",
          "data-input": "#global_computer_networks",
          "data-filter": "true"
        }
      },
      "configuration": {
        "global_search":    { "show": true, "search_field_reference_id": "global_computer_networks"},
        "group_search":     { "show": false },
        "detail_search":    { "show": false },
        "configure_search": { "show": false },
        "pagination":       { "show": false },
        "record_info":      { "show": false },
        "select_info":      { "show": false },
        "checkbox":         { "show": false },
        "sorting":          { "show": false },
        //"editable":       { "show": false },
        //"lazyload":       { "show": false }
        "link_to_records":  { "show": false },
        "build_to_merge":   { "show": false },
        "caption":          { "show": false }
      },
      "view": [
        {"title": "_id", "show": false, "priority": 5 },
        {"title": "status", "show": true, "persist":"true", "status": true },
        {"title": "my_title", "show": true, "persist":"true"},
        {"title": "my_reference", "show": true, "persist":"true"},
        {"title": "my_translated_validation_state_title","show": true, "priority": 6  }
      ],
      "actions": []
    },
    /* ******************************************************************** */
    /*                            Networks_01                               */
    /* ******************************************************************** */
    "networks_01": {
      "datasource": "Computer Networks",
      "portal_type_title": "networks",
      "layout": {
        "type": "table",
        "direct": {
          "id": "networks_1",
          "className":"table-stroke ui-responsive"
        },
        "attributes": {
          "data-role": "table",
          "data-mode": "columntoggle",
          "data-use-pop": false,
          "data-enhanced": false,
          "data-column-btn-show": false,
          "data-column-btn-icon": "expand-alt",
          "data-column-btn-theme": "slapos-white",
          "data-column-btn-text": "Toggle",
          "data-wrap": "both",
          "data-top-grid": 1,
          "data-bottom-grid": 1,
          "data-sorting": "true"
        }
      },
      "configuration": {
        "global_search":    { "show": true, "search_field_reference_id": "global_search_networks"},
        "group_search":     { "show": false },
        "detail_search":    { "show": false },
        "configure_search": { "show": false },
        "pagination":       { "show": false },
        "record_info":      { "show": false },
        "select_info":      { "show": false },
        "checkbox":         { "show": false },
        "sorting":          { "show": false },
        //"editable":       { "show": false },
        //"lazyload":       { "show": false }
        "link_to_records":  { "show": false },
        "build_to_merge":   { "show": false },
        "caption":          { "show": false }
      },
      "view": [
        {"title": "_id", "show": false, "priority": 5 },
        {"title": "my_title", "show": true, "persist":"true"},
        {"title": "my_reference", "show": true, "persist":"true"},
      ],
      "actions": []
    },
    /* ******************************************************************** */
    /*                            Invoices_01                               */
    /* ******************************************************************** */
    "invoices_01": {
      "datasource": "Sale Invoice Transaction",
      "portal_type_title": "invoices",
      "layout": {
        "type": "table",
        "direct": {
          "id": "invoices_1",
          "className":"table-stroke ui-responsive"
        },
        "attributes": {
          "data-role": "table",
          "data-mode": "columntoggle",
          "data-use-pop": false,
          "data-enhanced": false,
          "data-column-btn-show": false,
          "data-column-btn-icon": "expand-alt",
          "data-column-btn-theme": "slapos-white",
          "data-column-btn-text": "Toggle",
          "data-wrap": "both",
          "data-top-grid": 1,
          "data-bottom-grid": 1,
          "data-sorting": "true"
        }
      },
      "configuration": {
        "global_search":    { "show": true, "search_field_reference_id": "global_search_invoices"},
        "group_search":     { "show": false },
        "detail_search":    { "show": false },
        "configure_search": { "show": false },
        "pagination":       { "show": false },
        "record_info":      { "show": false },
        "select_info":      { "show": false },
        "checkbox":         { "show": false },
        "sorting":          { "show": false },
        //"editable":       { "show": false },
        //"lazyload":       { "show": false },
        "link_to_records":  { "show": false },
        "build_to_merge":   { "show": false },
        "caption":          { "show": false }
      },
      "view": [
        {"title": "_id", "show": false, "priority": 5 },
        {"title": "my_invoice_date", "show": true, "persist": true },
        {"title": "my_total_price", "show": true, "persist": true},
        {"title": "my_price_currency", "show": true, "priority": 4 },
        {"title": "my_translated_simulation_state_title", "show": true, "priority": 6  },
        {"title": "download", "show": true, "persist": true, "export": true }
      ],
      "actions": []
    },
    /* ******************************************************************** */
    /*                            Listbox_01                                */
    /* ******************************************************************** */
    "listbox_01": {
      "datasource": "computer",
      "portal_type_title": "computer",
      "layout": {
        "type": "table",
        "direct": {
          "id": "computer_1",
          "className":"table-stroke ui-responsive"
        },
        "attributes": {
          "data-role": "table",
          "data-mode": "columntoggle",
          "data-use-pop": false,
          "data-enhanced": false,
          "data-column-btn-show": false,
          "data-column-btn-icon": "expand-alt",
          "data-column-btn-theme": "slapos-white",
          "data-column-btn-text": "Toggle",
          "data-wrap": "both",
          "data-top-grid": 2,
          "data-bottom-grid": 1,
          "data-sorting": "true"
        }
      },
      "configuration": {
        "global_search":    { "show": true, "search_field_reference_id": "global_search_computers" },
        "group_search":     { "show": false },
        "detail_search":    { "show": true, "slot": 1 },
        "configure_search": { "show": true, "slot": 2 },
        "pagination":       { "show": true, "slot": 3, "items_per_page_select": [5,10,25,50], "icons": ["step-backward", "backward", "reorder", "forward", "step-forward"] },
        "record_info":      { "show": true },
        "select_info":      { "show": true },
        "checkbox":         { "show": true },
        "sorting":          { "show": true },
        //"editable":       { "show": true,  "autocomplete": true,  "max_suggestions": 10 },
        //"lazyload":       { "show": false },
        "link_to_records":  { "show": false },
        "build_to_merge":   { "show": false },
        "caption":          { "show": false }
      },
      "view": [
        {"title": "_id", "show": false, "priority": 5, "sort": true,   "search": {"type": "text"} },
        {"title": "category", "show": false, "priority": 5, "sort": true,   "search": {"type": "select", "multiple":"true","options":["Amazon.Group", "Atlantic.net Group", "Bull Group", "Slapos Company", "Gandi Group", "IBM Group", "Joyent Group", "OVH Group", "Microsoft Group", "Rackspace Group", "VIFIB Group", "wmWare Group"], "subsearch":"checkbox", "value":"Strict"}  },
        {"title": "contributor", "show": false, "priority": 2, "sort": true,   "search": {"type": "text"} },
        {"title": "created", "show": false, "priority": 4, "sort": true,   "search": {"type": "date"} },
        {"title": "date", "show": false, "priority": 4, "sort": true,   "search": {"type": "date"}  },
        {"title": "description", "show": false, "priority": 5, "sort": true,   "search": {"type": "text"}  },
        {"title": "language", "show": false, "priority": 4, "sort": true,   "search": {"type": "select", "multiple":"true", "options":[]} },
        {"title": "modified","show": false, "priority": 6, "sort": true,   "search": {"type": "date"}},
        {"title": "reference", "show": true,  "priority": 4, "sort": true,   "search": {"type": "text", "subsearch": "flip", "options": ["exact", "key"]}},
        {"title": "title", "show": true,  "persist": true, "sort": true, "search": {"type": "text"}},
        {"title": "type", "show": false, "priority": 6, "sort": true },
        {"title": "state", "show": true, "priority": 3, "sort": true, "lookup": "getValidationState", "search": {"type":"select", "options":[]} },
        {"title": "status", "show": true, "persist": true, "sort": true, "lookup": "getValidationStatus", "search": {"type":"select", "options":[]}}
      ],
      "actions": []
    },
    /* ******************************************************************** */
    /*                            Listbox_02                                */
    /* ******************************************************************** */
    "listbox_02": {
      "datasource": "Hosting Subscriptions",
      "portal_type_title": "services",
      "layout": {
        "type": "table",
        "direct": {
          "id": "services_1",
          "className":"table-stroke ui-responsive"
        },
        "attributes": {
          "data-role": "table",
          "data-mode": "columntoggle",
          "data-use-pop": false,
          "data-enhanced": false,
          "data-column-btn-show": false,
          "data-column-btn-icon": "expand-alt",
          "data-column-btn-theme": "slapos-white",
          "data-column-btn-text": "Toggle",
          "data-wrap": "both",
          "data-top-grid": 2,
          "data-bottom-grid": 1,
          "data-sorting": "true"
        }
      },
      "configuration": {
        "global_search":    { "show": true, "search_field_reference_id": "global_search_services" },
        "group_search":     { "show": false },
        "detail_search":    { "show": true, "slot": 1 },
        "configure_search": { "show": true, "slot": 2 },
        "pagination":       { "show": true, "slot": 3, "items_per_page_select": [5,10,25,50], "icons": ["step-backward", "backward", "reorder", "forward", "step-forward"] },
        "record_info":      { "show": true },
        "select_info":      { "show": true },
        "checkbox":         { "show": true },
        "sorting":          { "show": true },
        //"editable":       { "show": true,  "autocomplete": true,  "max_suggestions": 10 },
        //"lazyload":       { "show": false },
        "link_to_records":  { "show": false },
        "build_to_merge":   { "show": false },
        "caption":          { "show": false }
      },
      "view": [
        {"title": "_id", "show": false, "sort": true, "priority": 5,   "search": {"type": "text"}},
        {"title": "title","show": true,                "persist": true, "search": {"type": "text"}  },
        {"title": "reference", "show": true,  "sort": true, "priority": 4,   "search": {"type": "text",  "subsearch": "flip", "options": ["Exact", "Key"]} },
        {"title": "category", "show": false, "sort": true, "priority": 5,   "search": {"type": "select", "multiple":"true","options":[]}  },
        {"title": "contributor",  "show": false, "sort": true, "priority": 2,   "search": {"type": "text"} },
        {"title": "created", "show": false, "sort": true, "priority": 4,   "search": {"type": "date"}, "subsearch": "select", "options": ["Equal", "Greater", "Less"]},
        {"title": "date", "show": false, "sort": true, "priority": 4,   "search": {"type": "date"}},
        {"title": "description", "show": false, "sort": true, "priority": 5,   "search": {"type": "text"}},
        {"title": "language","show": false, "sort": true, "priority": 4,   "search": {"type": "select", "multiple":"true", "options":[]} },
        {"title": "modified", "show": false, "sort": true, "priority": 6,   "search": {"type": "date"}},
        {"title": "root_software_type", "show": false, "sort": true, "priority": 1,   "search": {"type": "text"}},
        {"title": "root_xml","show": false, "sort": true, "priority": 1,   "search": {"type": "text"} },
        {"title": "root_sla_xml", "show": false, "sort": true, "priority": 1,   "search": {"type": "text"}},
        {"title": "frequency_weekdays", "show": false, "sort": true, "priority": 1,   "search": {"type": "number", "subsearch": "range", "min":0, "max": 60}},
        {"title": "frequency_minutes", "show": false, "sort": true, "priority": 1,   "search": {"type": "number"} },
        {"title": "frequency_hours", "show": false, "sort": true, "priority": 1,   "search": {"type": "number"} },
        {"title": "frequency_days", "show": false, "sort": true, "priority": 1,   "search": {"type": "number"}},
        {"title": "frequency_weeks",  "show": false, "sort": true, "priority": 1,   "search": {"type": "number"} },
        {"title": "frequency_months", "show": false, "sort": true, "priority": 1,   "search": {"type": "number"} },
        {"title": "validation_state", "show": true, "priority": 3, "lookup": "getValidationState", "search": {"type":"select", "options":[]}},
        {"title": "slap_state", "show": true, "persist": true, "lookup": "getSlapState", "search": {"type":"select", "options":[]}}
      ],
      "actions": []
    },
    /* ******************************************************************** */
    /*                            Listbox_03                                */
    /* ******************************************************************** */
    "listbox_03": {
      "datasource": "computer",
      "portal_type_title": "computer",
      "layout": {
        "type": "table",
        "direct": {
          "id": "computer_1",
          "className":"table-stroke ui-responsive"
        },
        "attributes": {
          "data-role": "table",
          "data-mode": "columntoggle",
          "data-use-pop": false,
          "data-enhanced": false,
          "data-column-btn-show": false,
          "data-column-btn-icon": "expand-alt",
          "data-column-btn-theme": "slapos-white",
          "data-column-btn-text": "Toggle",
          "data-wrap": "both",
          "data-top-grid": 1,
          "data-bottom-grid": 1,
          "data-sorting": "true"
        }
      },
      "configuration": {
        "global_search":    { "show": undefined },
        "group_search":     { "show": undefined },
        "detail_search":    { "show": undefined },
        "configure_search": { "show": undefined },
        "pagination":       { "show": true, "slot": 2, "items_per_page_select": [5,10,25,50], "icons": ["step-backward", "backward", "reorder", "forward", "step-forward"] },
        "record_info":      { "show": true },
        "select_info":      { "show": undefined },
        "checkbox":         { "show": undefined },
        "sorting":          { "show": true },
        "link_to_records":  { "show": false },
        "build_to_merge":   { "show": false },
        "caption":          { "show": false }
      },
       "view": [
        {"title": "_id", "show": false, "priority": 5, "sort": false },
        {"title": "index", "show": true,  "priority": 5, "sort": true},
        {"title": "coordinate_type", "show": true, "priority": 6, "sort": true},
        {"title": "title", "show": true, "persist": true, "sort": true },
        {"title": "coordinate_function", "show": true, "priority": 3, "sort": true },
        {"title": "value",  "show": true, "priority": 3, "sort": false }
      ],
      "actions": []
    },
    /* ******************************************************************** */
    /*                            tabs_01                                   */
    /* ******************************************************************** */
    "tabs_01": {
      "portal_type_title": "computer",
      "configuration": {
        "editable": false,
        "autosave": "collapsiblebeforeexpand"
      },
      "layout": [
        {
          "title": "View",
          "i18n": "computer.tabs.names.view",
          "blocks": [
            {
              "fullscreen": false,
              "fields": [
                "my_title",
                "my_reference",
                "my_group",
                "my_specialize_title"
              ],
              "overrides": {}
            },
            {
              "fullscreen": false,
              "fields": [
                "my_quantity",
                "my_default_network_address_host_name",
                "my_default_network_address_ip_address",
                "my_default_network_address_netmask",
                "my_translated_validation_state_title"
              ],
              "overrides": {
                "my_quantity": {
                  "default": 0
                },
                "my_translated_validation_state_title": {
                  "editable": false
                }
              }
            },
            {
              "fullscreen": true,
              "fields": [
                "my_description"
              ],
              "overrides":{}
            },
            {
              "fullscreen": true,
              "fields": [],
              "view": {
                "gadget_id": "listbox_03",
                "renderWith": "constructListbox"
              }
            }
          ]
        },{
          "title": "Computer Partitions",
          "i18n": "computer.tabs.names.partitions",
          "blocks": [
            {
              "fullscreen": false,
              "fields": [
                "my_title",
                "my_reference",
                "my_group"
              ],
              "overrides": {
                "my_reference": {
                  "disabled": true
                }
              }
            }
          ]
        }, {
          "title": "Model",
          "i18n": "computer.tabs.names.model",
          "blocks": [
            {
              "fullscreen": false,
              "fields": [
                "my_title",
                "my_reference",
                "my_group",
                "my_cpu_core",
                "my_cpu_frequency",
                "my_cpu_type",
                "my_local_area_network_type",
                "my_memory_size",
                "my_memory_type"
              ],
              "overrides": {
                "my_reference":{
                  "editable": false
                }
              }
            }, {
              "fullscreen": false,
              "fields": [
                "my_region",
                "my_storage_capacity",
                "my_storage_interface",
                "my_storage_redundancy",
                "my_storage_technology",
                "my_wide_area_network_type",
                "my_translated_validation_state_title"
              ],
              "overrides": {
                "my_translated_validation_state_title": {
                  "editable": false
                }
              }
            }
 
          ]
        }, {
          "title": "Capacity",
          "i18n": "computer.tabs.names.capacity",
          "blocks": [
            {
              "fullscreen": false,
              "fields": ["my_title"],
              "overrides": {}
            }
          ]
        }, {
          "title": "Tcp Port Number",
          "i18n": "computer.tabs.names.tcpportnumbers",
          "blocks": []
        }, {
          "title": "Computer Useage",
          "i18n": "computer.tabs.names.usage",
          "blocks": []
        }, {
          "title": "Consistency",
          "i18n": "computer.tabs.names.consistency",
          "blocks": []
        }, {
          "title": "History",
          "i18n": "computer.tabs.names.history",
          "blocks": []
        }, {
          "title": "Metadata",
          "i18n": "computer.tabs.names.metadata",
          "blocks": [
            {
              "fullscreen": false,
              "fields": ["my_title"],
              "overrides": {}
            }
          ]
        }
      ]
    }
  };

  /* ====================================================================== */
  /*                              METHODS                                   */
  /* ====================================================================== */

  /* ====================================================================== */
  /*                              HELPERS                                   */
  /* ====================================================================== */
  // NOTE: generic functions used throughout
  /**
    * map ERP5 field type to HTML elements
    * @method mapFieldType
    * @param {string} type ERP5 field type
    * @return {string} element
    */
  priv.mapFieldType = function (type) {
    var element;
    switch (type) {
      case "StringField":
      case "RelationStringField":
      case "IntegerField":
        element = "input";
        break;
      case "ListField":
        element = "select";
        break;
      case "TextareaField":
        element = "textarea";
        break;
    };
    return element;
  };


  /**
   * map ERP5 field type to input type
   * @method mapFieldType
   * @param {string} type ERP5 field type
   * @return {string} element
   */
  priv.mapInputType = function (type) {
    var field_type = null;
    switch (type) {
      case "StringField":
      case "RelationStringField":
        field_type = "text";
        break;
      case "IntegerField":
        field_type = "number";
        break;
    }
    return field_type;
  }

  /**
   * Convert 1,2,3 into a,b,c
   * @method: toLetters
   * @param: {number} number Number to convert
   * @returns: {string} letter
   */
  priv.toLetters = function (number) {
    var mod = number % 26,
      pow = number / 26 | 0,
      out = mod ? String.fromCharCode(64 + mod) : (--pow, 'Z');
    return pow ? toLetters(pow) + out : out;
  }

  /**
   * Build a string from array
   * @method: buildValue
   * @param: {string/array} value String/Array passed
   * @returns: {string} string
   */
  priv.buildValue = function (value) {
    var i = 0,
      setter = "",
      property;

    if (typeof value === "string") {
      setter = value;
    } else if (typeof value === "object") {
      for (property in value) {
        if (value.hasOwnProperty(property)) {
          setter += (i === 0 ? "" : ", ") + value[property];
          i += 1
        }
      }
    } else {
      for (i; i < value.length; i += 1) {
        setter += (i === 0 ? "" : ", ") + value[i];
      }
    }
    return setter || "could not generate value";
  };

  /**
   * Append values in form
   * @method: setValue
   * @param: {string} type Type of object
   * @param: {string} key Key to set
   * @param: {string/array} value Value to set key to
   */
  priv.setValue = function (type, key, value) {
    var i,
      j,
      k,
      unit,
      element,
      getter,
      single_option,
      elements = document.getElementsByName(type + "_" + key),
      setter = priv.buildValue(value),
      // ...PFFFFFFFFFFFFFF standards require so much customization...
      dublin_core_date_time_fields = [
        "date",
        "created",
        "modified",
        "effective_date",
        "expiration_date"
      ],
      time_fields = ["year", "month", "day"];

    // can't be generic... yet
    for (i = 0; i < dublin_core_date_time_fields.length; i += 1) {
      if (key === dublin_core_date_time_fields[i]) {
        for (k = 0; k < time_fields.length; k += 1) {
          unit = time_fields[k];
          element = document.getElementsByName(
            type + "_" + key + "_" + unit
          );

          if (element.length > 0) {
            single_option = element[0].getElementsByTagName("option");
            switch(unit) {
            case "year":
              getter = new Date(setter).getFullYear();
              break;
            case "month":
              getter = new Date(setter).getMonth() + 1;
              break;
            case "day":
              getter = new Date(setter).getDate();
              break;
            }
            if (single_option.length === 1) {
              single_option[0].setAttribute("value", getter);
              single_option[0].text = getter;
              single_option[0].parentNode.parentNode.getElementsByTagName("span")[0].innerHTML = getter;
            } else {
              element[0].value = getter;
            }
          }
        }
      }
    }

    for (j = 0; j < elements.length; j += 1) {
      elements[j].value = setter;
    }
  };

//   /**
//     * Generate input form for an item
//     * @method generateItem
//     * @param  {string} mode View Clone/Edit/Add
//     * @param  {string} item Element to show
//     */
//   // NOTE: this should be in another gadget/file
//   priv.generateItem = function (mode, item) {
//
//     if (item) {
//       // fetch data
//       priv.erp5.get({"_id": item}, function (error, response) {
//         var property, value, abort;
//
//         if (response) {
//           for (property in response) {
//             if (response.hasOwnProperty(property)) {
//               value = response[property];
//               priv.setValue(response.type.toLowerCase(), property, value);
//             }
//           }
//         } else {
//           abort = confirm("Error trying to retrieve data! Go back to overview?");
//           if (abort === true) {
//             $.mobile.changePage("computers.html");
//           }
//         }
//       });
//     }
//   };

  /**
    * Create a serialized object from all values in the form
    * @method serializeObject
    * @param  {object} form Form to serialize
    * @returns  {string} JSON form values
    */
  priv.serializeObject = function(form) {
    var o = {};
    var a = form.serializeArray();
    $.each(a, function() {
      if (o[this.name] !== undefined) {
          if (!o[this.name].push) {
              o[this.name] = [o[this.name]];
          }
          o[this.name].push(this.value || '');
      } else {
          o[this.name] = this.value || '';
      }
    });
    return o;
  };

  // date conversion object container
  priv.dates = {};

  /**
    * Create a serialized object from all values in the form
    * @method validateObject
    * @param  {object} serialized object
    * @returns  {object} object ready to pass to JIO
    */
  // TODO: should be made generic by passing the type and a recipe for
  // which fields to format how
  priv.validateObject = function (object) {
    var validatedObject = {},
      property,
      setter,
      value,
      i,
      j,
      clean_property,
      add_property,
      date_property,
      date_component,
      new_date,
      // NOTE: ... to time to be generic...
      convertToArray = ["contributor", "category"],
      seperator_character = ",",
      convertToDate = ["effective_date", "expiration_date"];

    for (property in object) {
      add_property = true;
      if (object.hasOwnProperty(property)) {
        value = object[property];
        clean_property = property.replace("computer_", "");

        // multiple entries
        if (typeof value !== "string") {
          if(value.length > 0) {
            // this should only happen if a field is in the form multiple times!
            // NOTE: not nice
            setter = value[0];
          }
        } else {
          setter = value;
        }

        // convert to array
        for (i = 0; i < convertToArray.length; i += 1) {
          if (convertToArray[i] === clean_property ) {
            setter = object[property].split(seperator_character);
          }
        }

        // set up date conversion
        for (j = 0; j < convertToDate.length; j += 1) {
          date_property = convertToDate[j];
          if (clean_property.search(date_property) !== -1) {
            add_property = false;
            if (priv.dates[date_property] === undefined) {
              priv.dates[date_property] = {};
            }
            // ...
            date_component = clean_property.split("_")[2];
            priv.dates[date_property][date_component] = value;
          }
        }
        if (add_property) {
          validatedObject[clean_property] = setter;
        }
      }
    }

    // timestamp modified
    validatedObject.modified = new Date().toJSON();

    // timestamp create and date
    if (validatedObject.date === undefined) {
      validatedObject.date =  validatedObject.modified;
    }
    if (validatedObject.create === undefined) {
      validatedObject.create =  validatedObject.modified;
    }

    // HACK: add missing type!
    if (validatedObject.type === undefined || validatedObject.type === "") {
      validatedObject.type = "Computer";
    }

    // build dates
    for (date in priv.dates) {
      if (priv.dates.hasOwnProperty(date)) {
        new_date = priv.dates[date];
        validatedObject[date] = new Date(
          new_date["year"], new_date["month"], new_date["day"]
        ).toJSON();
        // delete this date
        delete priv.dates[date];
      }
    }
    return validatedObject;
  }

   /**
    * Store object in EPR5
    * @method modifyObject
    * @param  {object} object Validated object
    * @param  {method} string PUT or POST
    */
  priv.modifyObject = function (object, method, callback) {
    priv.erp5[method](object, function (error, response) {
      if (error) {
        console.log(error);
        alert("oops..., an error occurred trying to store");
      } else {
        console.log(response);
        alert("worked");
        if (callback) {
          callback();
        }
      }
    });
  };

  /**
    * Create array of URL parameters
    * @method splitSearchParams
    * @param  {string} url URL to split
    * @returns {array} array of url parameters
    */
  priv.splitSearchParams = function (url) {
    var path;

    if (url === undefined) {
      path = window.location;
    } else {
      path = url;
    }

    return $.mobile.path.parseUrl(path).search.slice(1).split("&");
  }

  /**
   * Test for a class name
   * @method testForClass
   * @param {string} classString The string to test
   * @param {string} test The class to test against
   * @return {boolean} result True/False
   */
  // NOTE: this method requires a shim if used on IE8-
  priv.testForClass = function (classString, test) {
    return ('' + classString + '').indexOf(' ' + test + ' ') > -1;
  };

  /**
  * Filter a string for a class name
  * @method filterForClass
  * @param  {string} class The string to filter
  * @return {object} regex
  */
  priv.filterForClass = function (className) {
    return new RegExp("(?:^|\\s)" + className + "(?!\\S)", "g");
  };

  /**
  * Replace substrings to another strings
  * @method recursiveReplace
  * @param  {string} string The string to do replacement
  * @param  {array} list_of_replacement An array of couple
  * ["substring to select", "selected substring replaced by this string"].
  * @return {string} The replaced string
  */
  priv.recursiveReplace = function (string, list_of_replacement) {
    var i, split_string = string.split(list_of_replacement[0][0]);
    if (list_of_replacement[1]) {
      for (i = 0; i < split_string.length; i += 1) {
        split_string[i] = priv.recursiveReplace(
          split_string[i],
          list_of_replacement.slice(1)
        );
      }
    }
    return split_string.join(list_of_replacement[0][1]);
  };

  /**
  * Changes & to %26
  * @method convertToUrlParameter
  * @param  {string} parameter The parameter to convert
  * @return {string} The converted parameter
  */
  priv.convertToUrlParameter = function (parameter) {
    return priv.recursiveReplace(parameter, [[" ", "%20"], ["&", "%26"]]);
  };

  /**
    * Create a URL string for authentication (same as ERP5 storage)
    * @method createEncodedLogin
    */
  priv.createEncodedLogin = function () {
    return "__ac_name=" + priv.convertToUrlParameter(priv.username) +
        "&" + (typeof priv.password === "string" ?
                "__ac_password=" +
                priv.convertToUrlParameter(priv.password) + "&" : "");
  };

  /**
    * Modify an ajax object to add default values
    * @method makeAjaxObject
    * @param  {object} json The JSON object
    * @param  {object} option The option object
    * @param  {string} method The erp5 request method
    * @param  {object} ajax_object The ajax object to override
    * @return {object} A new ajax object with default values
    */
  priv.makeAjaxObject = function (key) {
    var ajax_object = {};

    ajax_object.url = priv.url + key + "?" + priv.createEncodedLogin() + "disable_cookie_login__=1";
    // exception: ajax_object.url = priv.username + ":" + priv.password + "@" + priv.url + key;
    ajax_object.dataType = "text/plain";
    ajax_object.async = ajax_object.async === false ? false : true;
    ajax_object.crossdomain = ajax_object.crossdomain === false ? false : true;
    return ajax_object;
  };

  /**
    * Runs all ajax requests for propertyLookups
    * @method getERP5property
    * @param  {string} id The id of the object to query
    * @param  {string} lookup The method to retrieve the property
    * @return {string} The property value
    */
  // NOTE: need a different way because this triggers a ton of http requests!
  priv.getERP5property = function (id, lookup) {
    var key = id + "/" + lookup;
    // return $.ajax(priv.makeAjaxObject(key));
    return {"error":"foo"}
  };

  /**
    * Uppercase first letter of a string
    * @method capitaliseFirstLetter
    * @param  {string} string To uppercase first letter
    * @return {string} Capitalized string
    */
  priv.capitaliseFirstLetter = function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

//   /* ********************************************************************** */
//   /*                         JIO Setup & Access                             */
//   /* ********************************************************************** */
//   // login attributes needed for Tristans or Romains ERP5 instance
//   // NOTE: for the examples to work, JIO must support promises/deferred
//   // only the branch new_design supports them. On this branch, only
//   // localstorage is available.
//   // WARNING: switching to ERP5 storage will only work, if JIO ERP5 storage
//   // can handel promises.
//   priv.url = "http://192.168.242.86:12002/erp5";
//   priv.mode = "generic";
//   priv.auth_type = "none";
//   priv.username = "zope";
//   priv.password = "insecure";
//   priv.encoded_login = null;
// 
// 
// //   // ERP5 connect
// //   priv.erp5 = jIO.newJio({
// //     "type": "erp5",
// //     "url": priv.url,
// //     "username": priv.username,
// //     "password": priv.password
// //   });
// 
//   priv.erp5 = jIO.createJIO({
//     "type": "local",
//     "username": "erp5",
//     "application_name": "dump"
//   }, {
//     "workspace": {}
//   });


  /* ====================================================================== */
  /*                            GENERATORS                                  */
  /* ====================================================================== */
  // Generators make generic elements and JQM widgets!

  /* ********************************************************************** */
  /*                              Element                                   */
  /* ********************************************************************** */
  // generates all elements.
  // NOTE: Provide jsperf before making this faster!

  /**
   * Generates elements based on supplied configuration
   * @method: generateElement
   * @param: {type} string Type of element to generate
   * @param: {object} options Parameters settable directly (id, name, value..)
   * @param: {object} attributes Parameters settable with setAttribute
   * @param: {object} setters Parameters requiring logic (if-else-etc) 
   * @returns: {object} HTML object 
   */
  priv.generateElement = function (type, options, attributes, setters) {
    var property,
      attribute,
      data,
      i,
      mock,
      values,
      recurse,
      pic,
      element = document.createElement(type);

    // directly settable
    for (property in options) {
      if (options.hasOwnProperty(property)) {
        element[property] = options[property];
      }
    }

    // must use setAttribute
    for (data in attributes) {
      if (attributes.hasOwnProperty(data)) {
        element.setAttribute(data, attributes[data]);
      }
    }

    // requiring logic to be set
    for (attribute in setters) {
      mock = attribute.slice(0, 5) === "data-" ? "data-" : attribute;

      if (setters.hasOwnProperty(attribute)) {
        switch (mock) {
          case "disabled":
          case "selected":
            if (setters[attribute]) {
              element.setAttribute(attribute, attribute);
            }
          break;
          case "id":
          case "name":
          case "value":
          case "data-":
          case "type":
          case "readonly":
          case "size":
            if (setters[attribute]) {
              element.setAttribute(attribute, setters[attribute]);
            }
          break;
          case "text":
            element.appendChild(document.createTextNode(setters["text"]));
          break;
          case "img":
            pic = setters["img"];
            element.appendChild(priv.generateElement(
              "img",
              {"src": pic.href, "alt": pic.alt}
            ));
          break;
          case "options":
            // recursive!
            if (setters["options"]) {
              // if the option array contains strings, we need to fetch
              if (typeof setters["options"][0] === "string") {
                values = priv.get_hardcoded_values[setters["options"][0]];
                for (i = 0; i < values.length; i += 1) {
                  recurse = values[i];
                  element.appendChild(priv.generateElement(
                    "option",
                    {
                      "value": recurse.value,
                      "className": recurse.i18n ? "translate":""
                    },
                    {"data-i18n": recurse.i18n},
                    {
                      "text": recurse.text,
                      // this will not work!!!
                      "disabled": setters["options"][1] ? "disabled": null,
                      "selected": (i === 0 && setters["options"][2]) ? "selected" : null
                    })
                  );
                }
              } else {
                for (i = 0; i < setters["options"].length; i += 1) {
                  recurse = setters["options"][i];
                  element.appendChild(priv.generateElement(
                    "option",
                    {"value": recurse.value},
                    {},
                    {
                      "text": recurse.text,
                      "selected":recurse.selected,
                      "disabled":recurse.disabled
                    })
                  );
                }
              }
            }
          break;
          case "extra":
            // WARNING: since elements are generated in JavaScript vs pure text
            // extra-html cannot be simply added - instead it must be passed
            // as JSON object with properties and values to be set on the
            // element
            if (typeof setters["extra"] !== "string") {
              for (recurse in setters["extra"]) {
                if (setters["extra"].hasOwnProperty(recurse)) {
                  element.setAttribute(recurse, setters["extra"][recurse]);
                }
              }
            }
          break;
          case "grid":
            // recursive!
            for (i = 0; i < setters["grid"]; i += 1) {
              element.appendChild(priv.generateElement(
                "div", {}, {}, {})
              );
            }
          break;
        };
      }
    }

    return element;
  };

  /* ********************************************************************** */
  /*                              JQM Footer                                */
  /* ********************************************************************** */
  /**
   * Generates JQM footer with navbar or controlgroup based on JSON config
   * @method generateFooter
   * @param {object} config JSON configuration
   * @return {object} HTML fragment
   */
  priv.generateFooter = function (config) {
    var footer, wrap;

    footer = priv.generateElement(
      "div",
      {
        "className":"ui-footer " +
          (config.class || " ") +
          (config.fixed ? "ui-footer-fixed " : " ") +
          (config.transition || "") + " ui-bar-" +
          (config.theme || "inherit"),
      },
      {
        "data-role":"footer",
        "data-theme":config.theme,
        "data-enhanced":"true",
        "role":"contentinfo"
      },
      {
        "id": config.id || undefined,
        "data-position": config.fixed ? "fixed" : undefined
      }
    );
    // add navbar or controlgroup
    // TODO: and?
    if (config.type === "navbar") {
      wrap = priv.generateNavbar(config);
    } else {
      wrap = priv.generateControlgroup(config);
    }
    footer.appendChild(wrap);

    return footer;
  };

  /* ********************************************************************** */
  /*                            JQM Header                                  */
  /* ********************************************************************** */
  /**
  * Generates JQM header based on JSON config supplied. Note that header
  * buttons are wrapped in controlgroups!
  * @method generateHeader
  * @param {object} config JSON configuration
  * @return {object} HTML fragment
  */
  // TODO: add ability to hold images left middle and right
  priv.generateHeader = function (config) {
    var header,
      group,
      controls,
      right,
      title,
      wrap,
      i,
      j,
      buttons,
      direction,
      button,
      props,
      element,
      addTitle = function (title, i18n) {
        return priv.generateElement(
          "h1",
          {"className":"translate ui-title"},
          {
            "data-i18n": i18n || "",
            "role":"heading",
            "aria-level":"1"
          },
          {"text": title || "&nbsp;"}
        );
      };

    header = priv.generateElement(
      "div",
      {
        "className":"ui-header " +
          (config.class || " ") +
          (config.fixed ? "ui-header-fixed " : " ") +
          (config.transition || "") + " ui-bar-" +
          (config.theme || "inherit"),
      },
      {
        "data-role":"header",
        "data-theme":config.theme,
        "data-enhanced":"true",
        "role":"banner"
      },
      {
        "id": config.id || undefined,
        "data-position": config.fixed ? "fixed" : undefined
      }
    );
    if (config.logo) {
      wrap = priv.generateElement("div", {"className":"ui-header-logo wrap " + config.logo.wrap});
      wrap.appendChild(priv.generateElement(
        "img",
        {"src": config.logo.src, "alt":config.logo.alt},
        {"data-i18n":"[alt]"}
      ));
      header.appendChild(wrap);
    }
    if (config.controls && config.controls.length > 0) {
      for (i = 0; i < config.controls.length; i += 1) {
        direction = i === 0 ? "left" : "right";

        wrap = priv.generateElement("div", {"className":"wrap " + direction});
        group = priv.generateControlgroup(config.controls[i]);

        wrap.appendChild(group);
        header.appendChild(wrap);

        // don't forget the title placeholder
        if (i === 0) {
          header.appendChild(addTitle(config.title, config.title_i18n));
        }
      }
    } else {
      header.appendChild(addTitle(config.title, config.title_i18n));
    }

    return header;
  };

  /* ********************************************************************** */
  /*                            JQM POPUP                                   */
  /* ********************************************************************** */
  /**
  * Generate a pre-enhanced popup and necessary elements (without content!)
  * @method generatePopup
  * @param  {object} config JSON configuration for popup to be generated
  * @return {object} documentFragment
  */
  // TODO: make sure this works global/in page
  priv.generatePopup = function (config) {
    var popup,
      popup_wrap,
      container = document.createDocumentFragment();

    container.appendChild(priv.generateElement(
      "div",
      {"id": config.id + "-placeholder"},
      {"style": "display:none;"}
    ));
    container.appendChild(priv.generateElement(
      "div",
      {
        "className": "ui-popup-screen ui-screen-hidden " +
          (config.overlay_theme ? "ui-overlay-" + config.overlay_theme : ""),
        "id": config.id + "-screen"
      }
    ));
    popup_wrap = priv.generateElement(
      "div",
      {
        "className":
          "ui-popup-container ui-corner-all ui-popup-hidden ui-popup-truncate " + config.transition,
        "id": config.id + "-popup"
      }
    );
    popup = priv.generateElement(
      "div",
      {
        "className": "ui-popup ui-body-" + config.theme + (config.shadow ? " ui-overlay-shadow" : " ") + "ui-corner-all " + config.classes,
        "id": config.id
      },
      {
        "data-transition": config.transition,
        "data-role": "popup",
        "data-enhanced": "true",
        "data-position-to": config.position || "origin"
      },
      {
        "data-theme": config.theme || null,
        "data-overlay-theme": config.overlay_theme || null,
        "data-tolerance": config.tolerance || null
      }
    );

    popup_wrap.appendChild(popup);
    container.appendChild(popup_wrap);

    return container
  };
  /* ********************************************************************** */
  /*                            JQM Navbar                                  */
  /* ********************************************************************** */
  /* Generate a navbar
   * @method generateNavbar
   * @param {object} config Configuration options
   * @returns navbar HTML fragment
   */
  priv.generateNavbar = function (config) {
    var i, navbar, controls;

    navbar = priv.generateElement(
      "div",
      {"className":"navbar ui-navbar " + (config.type_class || "")},
      {"data-role":"navbar", "role":"navigation", "data-enhanced":"true"}
    );
    controls = priv.generateElement(
      "ul", {"className": "ui-grid-" + priv.toLetters(config.buttons.length)}
    );

    for (i = 0; i < config.buttons.length; i += 1) {
      button = config.buttons[i];

      item = priv.generateElement("li", {"className":"ui-block-" + priv.toLetters(i+1).toLowerCase()});
      item.appendChild(priv.generateLinkButton(button));
      controls.appendChild(item);
    }
    navbar.appendChild(controls);

    return navbar;
  };
  /* ********************************************************************** */
  /*                            JQM Controlgroup                            */
  /* ********************************************************************** */
  /* Generate an controlgroup = a button or action menu
   * @method generateControlgroup
   * @param {object} config Configuration options
   * @returns controlgroup
   */
  // NOTE: add all options
  priv.generateControlgroup = function (config) {
    var i, action_menu, action_controls;
    action_menu = priv.generateElement(
      "div", {
        "className":"ui-corner-all ui-controlgroup " + (config.class || "") +
          "ui-controlgroup-" + config.direction
      }, {
        "data-role":"controlgroup", "data-enhanced":"true"
      }, {
        "data-type": config.direction || null
      }
    );
    action_controls = priv.generateElement(
      "div", {
        "className":"ui-controlgroup-controls " + (config.control_class || "")
      }
    );

    // add buttons
    for (i = 0; i < config.buttons.length; i += 1) {
      button = config.buttons[i];
      action_controls.appendChild(priv.generateLinkButton(button));
    }
    action_menu.appendChild(action_controls);

    return action_menu;
  };

  /* ********************************************************************** */
  /*                                JQM Link Button                         */
  /* ********************************************************************** */
  /* Generate a link button ("a")
   * @method generateLinkButton
   * @param {object} config Configuration options
   * @returns button object
   */
  // TODO: should this be more extendable or rely on full JSON config passed?
  priv.generateLinkButton = function (config) {
    return button = priv.generateElement(
      config.type,
      config.options,
      config.attributes,
      config.setters
    );
  };

  /* ********************************************************************** */
  /*                                JQM Listview                            */
  /* ********************************************************************** */
  /*
   * Generate a JQM listview
   * @method generateListview
   * @param {object} config JSON configuration
   * @returns HTML object
   */
  priv.generateListview = function (config) {

  };

  /* ********************************************************************** */
  /*                                JQM Form Field                          */
  /* ********************************************************************** */
  /* Generate a form field (input, select, checkbox...)
   * @method generateFormField
   * @param {object} config Default parameters usable for this form field
   * @param {object} overrides Overrides for this instance
   * @param {object} properties Object with data to fill
   * @return {object} HTML document fragment
   */
  priv.generateFormField = function (config, overrides, data) {
    var wrap,
      element_wrap,
      validate,
      value = data || undefined,
      element = document.createDocumentFragment();

    if (config !== undefined || (overrides.enabled || config.validator.enabled) !== true) {

      // validation string
      if (overrides.external || config.validator.external) {
        validate = overrides.external_validator || config.validator.external_validator;
      }
      if (overrides.maximum_length || config.validator.maximum_length) {
        validate += "|" + "max_length:"+(overrides.maximum_length || config.validator.maximum_length) + "&truncate" + (overrides.truncate || config.validator.truncate);
      }
      if (overrides.maximum_lines || config.validator.maximum_lines) {
        validate += "|" + "max_lines:" + (overrides.maximum_lines || config.validator.maximum_lines);
      }
      if (overrides.maximum_lenght_of_line || config.validator.maximum_lenght_of_line) {
        validate += "|" + "max_length_lines:" + (overrides.maximum_lenght_of_line || config.validator.maximum_lenght_of_line);
      }
      if (overrides.preserve_whitespace || config.validator.preserve_whitespace) {
        validate += "|preserve_whitespace:true";
      }
      if (overrides.start || config.validator.start) {
        validate += "|start:" + (overrides.start || config.validator.start);
      }
      if (overrides.end || config.validator.end) {
        validate += "|end:" + (overrides.start || config.validator.start);
      }

      // field wrapper
      wrap = priv.generateElement(
        "div",
        {"className":"ui-fieldcontain translate"},
        {
          "title": (overrides.description || config.widget.description || "" ),
          "data-i18n": (overrides.description_i18n || config.widget.description_i18n || "")
        }
      );
      // field label
      wrap.appendChild(priv.generateElement(
        "label",
        {"className": "translate"},
        {
          "for": overrides.id || config.widget.id,
          "data-i18n": overrides.title_i18n || config.widget.title_i18n
        },
        {"text":  overrides.title || config.widget.title}
      ));

      // relationStringField
      // TODO: crap
      if (overrides.type === "RelationStringField" ||
        config.type === "RelationStringField") {
        element_wrap = priv.generateElement("div",
          {"className": "ui-input-text ui-body-inherit ui-corner-all ui-shadow-inset ui-input-has-clear ui-input-has-action"}
        );
        element_wrap.appendChild(priv.generateElement("input",
          {
            "id": overrides.id || config.widget.id,
            "className": ""
          }, {
            "data-enhanced": "true",
            "data-inset":"false",
            "data-clear-btn":"true"
          }
        ));
        element_wrap.appendChild(priv.generateElement("a",
          {
            "href":"",
            "className": "ui-input-clear ui-input-clear-hidden ui-btn ui-icon-delete ui-btn-icon-notext ui-corner-all",
            "title": "Clear input element"
          }, {
            "data-role": "button",
            "data-i18n": "[title]generic.buttons.clear;generic.buttons.clear"
          }, {
            "text":"clear input element"
          }
        ));
        element_wrap.appendChild(priv.generateElement("a",
          {
            "href":"",
            "className": "ui-disabled ui-input-action ui-btn ui-icon-plane ui-btn-icon-notext ui-corner-all",
            "title": "jump to selected object"
          }, {
            "data-role": "button",
            "data-i18n": "[title]generic.buttons.jump;generic.buttons.jump"
          }, {
            "text": "jump to selected object"
          }
        ));
        wrap.appendChild(element_wrap);
        wrap.appendChild(priv.generateElement("ul",
          {
            "className":""
          },{
            "data-role":"listview",
            "data-inset":"true",
            "data-enhanced":"true",
            "data-filter":"true",
            "data-filter-reveal":"true",
            "data-input": "#relation-" + portal_type
          }
        ));
      } else {
        // element
        wrap.appendChild(priv.generateElement(
          priv.mapFieldType(overrides.type || config.type),
          {
            "className": (overrides.css_class || config.widget.css_class || "") + " " + ((overrides.required || config.validator.required) ? "required" : ""),
            "id": overrides.id || config.widget.id
          },
          {},
          {
            "data-relation": overrides.portal_type || config.widget.portal_type || null,
            "size": overrides.display_width || config.widget.display_width || overrides.size || config.widget.size || undefined,
            "rows": overrides.width || config.widget.width || undefined,
            "cols": overrides.height || config.widget.height || undefined,
            "disabled": (overrides.enabled || config.validator.enabled) ? undefined : true,
            "name": overrides.alternate_name || config.validator.alternate_name || undefined,
            "value": (value || (overrides.default === 0 ? "0" : overrides.default) || config.widget.default || undefined),
            "data-vv-validations": validate || null,
            "type": (overrides.hidden || config.widget.hidden) === true ? "hidden" : priv.mapInputType(overrides.type || config.type),
            "extra": overrides.extra || config.widget.extra || null,
            "readonly": (overrides.editable === false || config.validator.editable === false ) ? true : undefined,
            "options": (overrides.items || config.widget.items) ? ([overrides.items || config.widget.items || null, overrides.extra_per_item || config.widget.extra_per_item || null, overrides.select_first_item || config.widget.select_first_item || null]) : null
          }
        ));
      }
      element.appendChild(wrap);
    }

    return element;
  };

  /* ====================================================================== */
  /*                            CONSTRUCTORS                                */
  /* ====================================================================== */
  // Constructors generate gadgets utilizing generators!

  /* ********************************************************************** */
  /*                              field menu                                */
  /* ********************************************************************** */
  /** Construct a simple field menu
   * @method constructFieldList
   * @param {object} element Base element to enhance
   * @returns {object } HTML fragment
   */
  priv.constructFieldlist = function (element) {
    var i,
      k,
      j,
      field,
      config,
      overrides,
      content,
      box,
      section,
      fragment,
      gadget_id = element.getAttribute("data-gadget-id"),
      settings = priv.gadget_properties[gadget_id],
      portal_type = settings.portal_type_title,
      $parent = $(element.parentNode);

    if (settings !== undefined) {
      if (settings.form !== undefined) {
        fragment = priv.generateElement(
          "form", settings.form.direct, (settings.form.attributes || undefined), (settings.form.logic || undefined)
        );
      } else {
        fragment = window.document.createDocumentFragment();
      }

      for (i = 0; i < settings.layout.length; i += 1) {
        section = settings.layout[i];
        if (section.blocks) {
          for (j = 0; j < section.blocks.length; j += 1) {
            box = section.blocks[j];

            content = priv.generateElement(
              "div",
              {"className": "content_element " + (box.fullscreen ? "content_element_fullscreen" : "")}
            );
            // fields
            if (box.fields) {
              for (k = 0; k < box.fields.length; k += 1) {
                field = box.fields[k];
                config = priv.field_definitions[portal_type][field];
                overrides = box.overrides[field] || {};
                // all-in-one...
                content.appendChild(priv.generateFormField(config, overrides));
              }
              fragment.appendChild(content);
            }
            // actions
            if (box.actions) {
              for (l = 0; l < box.actions.length; l += 1) {
                content.appendChild(priv.generateControlgroup(box.actions[l]));
              }
            }
          }
        }
      }
    }

    $parent.empty().append( fragment ).enhanceWithin();
  };

  /* ********************************************************************** */
  /*                                 tab view                               */
  /* ********************************************************************** */
  /**
    * Create tab menu
    * @method constructTabs
    * @param {object} element Base table to enhance
    * @param {string} mode View to display
    * @param {string} item Id of item to display
    * @param {object} properties Properties of item to display
    * @returns {object} html object / deferred
    */
  priv.constructTabs = function (element, mode, item, properties) {
    var property,
      value,
      abort,
      i,
      j,
      k,
      set,
      collapsible,
      tab,
      tag,
      box,
      content,
      wrap,
      field,
      overrides,
      config,
      exist,
      validate,
      element_wrap,
      fragment = window.document.createDocumentFragment(),
      // tab config
      gadget_id = element.getAttribute("data-gadget-id"),
      settings = priv.gadget_properties[gadget_id],
      portal_type = settings.portal_type_title,

      // wrapper - could be a slot, too
      $parent = $(element.parentNode);

    // TODO: get settings here if not loaded
    if (settings !== undefined) {
      // tab container
      set = priv.generateElement(
        "div",
        {"className": "ui-dynamic-tabs"},
        {"data-role": "collapsible-set", "data-tabs": settings.layout.length || 1, "data-type": "tabs"}
      );

      // tabs
      for (i = 0; i < settings.layout.length; i += 1) {
        tab = settings.layout[i];
        collapsible = priv.generateElement(
          "div",
          {},
          {"data-role":"collapsible", "data-icon":"false", "data-collapsed": i === 0 ? false : true}
        );
        collapsible.appendChild(priv.generateElement(
          "h1",
          {"className":"translate"},
          {"data-i18n": tab.i18n},
          {"text": tab.title}
        ));

        if (tab.blocks !== undefined) {
          for (j = 0; j < tab.blocks.length; j += 1) {
            box = tab.blocks[j];

            // content element
            content = priv.generateElement(
              "div",
              {"className": box.fullscreen ? " content_element_fullscreen content_element" : "content_element"}
            );
            // fields
            if (box.fields) {
              for (k = 0; k < box.fields.length; k += 1) {
                field = box.fields[k];
                config = priv.field_definitions[portal_type][field];
                overrides = box.overrides[field] || {};
                // all-in-one...
                content.appendChild(priv.generateFormField(config, overrides));
              }
              fragment.appendChild(content);
            }
            // actions
            if (box.actions) {
              for (l = 0; l < box.actions.length; l += 1) {
                content.appendChild(priv.generateControlgroup(box.actions[l]));
              }
            }
            // nested gadgets ASYNC
            if (box.view) {
//               $.when(priv[box.view.renderWith](content, box.view.gadget_id)).then(function(fragment) {
//                   $(fragment.target).append(fragment.element).enhanceWithin();
//               });
            }
            collapsible.appendChild(content);
          }
        }
        set.appendChild(collapsible);
      }

      // add dynamic tabs
      if (settings.configuration.editable) {
        collapsible = priv.generateElement("div",
            {"className": "dashed add_tab"},
            {"data-role":"collapsible", "data-icon": "plus", "data-expanded-icon":"plus"},
            {}
        );
        collapsible.appendChild(priv.generateElement("h1",
            {"className":"translate"},
            {"data-i18n": "generic.layouts.tabs.add"},
            {"text":"Add tab"}
          )
        );
        set.appendChild(collapsible);
      }
      fragment.appendChild(set);
      if (settings.configuration.editable) {
        fragment.appendChild(
          priv.generateElement("p",
            {"className":"center ui-dynamic-info translate"},
            {"data-i18n": "generic.messages.tabs.empty"},
            {"text":"Your dashboard is empty. Click above to add tabs and gadgets displaying key information to your dashboard."}
          )
        );
      }

      // la viola - we touch the DOM once!!
      $parent.empty().append( fragment ).enhanceWithin();
    } else {
      element.appendChild(
        priv.generateElement("p",
          {"className":"center translate"},
          {"data-i18n": "generic.errors.no_settings"},
          {"text": "Error: No configuration available for this type of data!"}
        )
      );
    }
  };

    /* ********************************************************************** */
  /*                                 listbox                                */
  /* ********************************************************************** */
  /**
    * Create listbox table
    * @method constructListbox
    * @param {object} element Base element to replace with table/listbox
    * @param {object} answer Data to build the gadget
    * @param {string} internal id where to place element
    */
  priv.constructListbox = function (element, answer, internal) {
    var i,
      j,
      l,
      opts = [],
      config,
      shortcut,
      fragment_container,
      search_popup,
      controlbar,
      caption_slot,
      group_slot,
      detail_slot,
      configure_slot,
      pagination_wrap,
      pagination_slot,
      // table
      table,
      table_header,
      table_body,
      table_settings,
      page,
      // mh
      no_data_body,
      no_data_cell,
      portable,
      limit,
      $parent,
      gadget_id = element.getAttribute("data-gadget-id") || internal,
      settings = priv.gadget_properties[gadget_id],
      portal_type = settings ? settings.portal_type_title : undefined;

    if (internal) {
      // only used for bindings
      $parent = $(document);
    } else {
      $parent = $(element.parentNode);
    }

    // TODO: fetch default/user specified configuration
    if (settings !== undefined) {

      // fragment container
      fragment_container = window.document.createDocumentFragment();
      shortcut = settings.configuration;

      // ==================== controlbar ===============================
      controlbar = priv.generateElement("div", {"className":"ui-controlbar"},{},{});
      // global_search
      if (shortcut.global_search.show) {
        controlbar.appendChild(priv.generateElement("input",
          {
            "id": shortcut.global_search.search_field_reference_id || "",
            "type": "search"
          }, {
            "placeholder": "Search " + priv.capitaliseFirstLetter(portal_type),
            "data-icon": "search",
            "data-action-btn": "true"
          }, {}
        ));
      }
      controlbar.appendChild(priv.generateElement("span",
        {"className":"ui-plain-text"},{},{}
      ));
      // record_info
      if (shortcut.record_info.show) {
        controlbar.lastChild.appendChild(priv.generateElement("span",
          {"className":"erp5_" + portal_type + "_records_info"},{},{}
        ));
      }
      // select_info
      if (shortcut.select_info.show) {
        controlbar.lastChild.appendChild(priv.generateElement("span",
          {"className":"erp5_" + portal_type + "_select_info"},{},{}
        ));
      }
      // filter_info
      if (shortcut.group_search.show) {
        controlbar.lastChild.appendChild(priv.generateElement("span",
          {"className":"erp5_" + portal_type + "_filter_info"},{},{}
        ));
      }
      fragment_container.appendChild(controlbar);

      // ==================== wrapper elements ===============================
      // TODO: bundle...
      // caption
      if (shortcut.caption.show) {
        caption_slot = priv.generateElement("div",
          {},
          {"data-slot": true, "data-slot-id": shortcut.caption.slot}
        );
        caption_slot.appendChild(priv.generateElement("p",
          {},
          {"data-i18n": shortcut.caption.title_i18n},
          {"text": shortcut.caption.title}
        ));
        fragment_container.appendChild( caption_slot );
      }
      // group-filter
      if (shortcut.group_search.show) {
        search_popup = true;
        group_slot = priv.generateElement("div",
          {},
          {"data-slot": "true", "data-slot-id":shortcut.group_search.slot}
        );
        group_slot.appendChild(priv.generateElement("a",
          {"className": "extended_search", "href": "#search_" + portal_type},
          {"data-reference":"groups", "data-rel":"popup", "data-transition":"pop","data-position-to":"window", "data-role":"button", "data-icon":"sitemap"},
          {"text":"Group"}
        ));
        fragment_container.appendChild( group_slot );
      }

      // detail search
      if (shortcut.detail_search.show) {
        search_popup = true;
        detail_slot = priv.generateElement("div",
          {},
          {"data-slot": "true", "data-slot-id":shortcut.detail_search.slot}
        );
        detail_slot.appendChild(priv.generateElement("a",
          {"className": "extended_search", "href": "#search_" + portal_type},
          {"data-reference":"details", "data-rel":"popup", "data-transition":"pop","data-position-to":"window", "data-role":"button", "data-icon":"filter"},
          {"text":"Extended Search"}
        ));
        fragment_container.appendChild( detail_slot );
      }

      // configure search
      if (shortcut.configure_search.show) {
        search_popup = true;
        configure_slot = priv.generateElement("div",
          {},
          {"data-slot": "true", "data-slot-id":shortcut.configure_search.slot}
        );
        configure_slot.appendChild(priv.generateElement("a",
          {"className": "extended_search", "href": "#search_" + portal_type},
          {"data-reference":"configure", "data-rel":"popup", "data-transition":"pop","data-position-to":"window", "data-role":"button", "data-icon":"cog"},
          {"text":"Configuration"}
        ));
        fragment_container.appendChild( configure_slot );
      }

      // ==================== wrapper popup ===============================
      if (search_popup) {
        fragment_container.appendChild(priv.generateElement("div",
          {"id": "search_" + portal_type, "className": "ui-popup-wide"},
          {"data-role":"popup", "data-tolerance":"30,30,30,30","data-theme":"aide-white"},
          {}
        ));
      }

      // ==================== pagination ===============================
      if (shortcut.pagination.show) {
        pagination_wrap = priv.generateElement("div",
          {"className":"ui-controlgroup ui-controlgroup-horizontal"},
          {"data-role":"controlgroup", "data-type":"horizontal"},
          {}
        );
        for (i = 0; i < 5; i += 1) {
          if (i !== 2) {
            pagination_wrap.appendChild(priv.generateElement("a",
              {"href":"#"},
              {"data-role":"button", "data-iconpos":"notext", "data-icon": shortcut.pagination.icons[i]},
              {"text":shortcut.pagination.icons[i]}
            ));
          } else {
            for (j = 0; j < shortcut.pagination.items_per_page_select.length; j += 1) {
              opts.push({
                "value":shortcut.pagination.items_per_page_select[j],
                "text":shortcut.pagination.items_per_page_select[j]
              });
            }
            pagination_wrap.appendChild(priv.generateElement("label",
              {"className":"ui-hidden-accessible"},
              {"for": portal_type + "_number_of_records"},
              {"text":"Number of records"}
            ));
            pagination_wrap.appendChild(priv.generateElement("select",
              {"id":portal_type + "_number_of_records","name":portal_type + "_number_of_records"},
              {"data-iconpos":"notext", "data-icon":shortcut.pagination.icons[i]},
              {"options":opts}
            ));
          }
        }
        pagination_slot = priv.generateElement("div",
          {},
          {"data-slot":"true", "data-slot-id":shortcut.pagination.slot},
          {}
        );
        pagination_slot.appendChild(pagination_wrap);
        fragment_container.appendChild( pagination_slot );
      }

      // ==================== table header  ===============================
      table_header = priv.generateTableHeader(settings, portal_type);

      // ==================== table body ==================================
      table_body = priv.generateTableBody(settings, answer, portal_type);

      // ==================== table footer ================================
      // TODO: add

      table = priv.generateElement(
        settings.layout.type,
        settings.layout.direct,
        settings.layout.attributes || {},
        settings.layout.logic || {}
      );
      table.appendChild(table_header);
      table.appendChild(table_body);

      // done
      fragment_container.appendChild( table );

      if (settings.actions) {
        for (l = 0; l < settings.actions.length; l += 1) {
          fragment_container.appendChild(priv.generateControlgroup(settings.actions[l]));
        }
      }

      // popup content handling
      if (search_popup) {
        $parent.on("click", "a.extended_search", function (e) {
          priv.generatePopupContents(e, "self", portal_type, settings.view, gadget_id);
        });
      }

      // table actions
      if (search_popup) {
        // NOTE: can't bind to $parent, because JQM moves the popup
        // outside of $parent
        page = $parent.closest("div.ui-page");

        if (page.data("bindings") === undefined) {
          page.data("bindings", {});
        }
        if (page.data("bindings")["table_action"] === undefined) {
          page.data("bindings")["table_action"] = true;

          $(document).on("click", "a.table_action", function (e) {
            var target,
              action = e.target.getAttribute("data-action"),
              popup = $(e.target).closest(".ui-popup"),
              form = popup.find("form");

            if (form.length === 0) {
              target = popup.find(".ui-content");
            } else {
              target = form;
            }
            switch (action) {
              case "add_criteria_search":
                target.append(priv.generateSearchCriteria(e.target))
                  .enhanceWithin();
              break;

              case "add_criteria_config":
                target.append(priv.generateConfigCriteria(e.target))
                  .enhanceWithin();
              break;
              case "delete_criteria":
                $(e.target).closest("div.ui-grid-row").remove();
              break;
            }
          });
        }
      }

      // check all 3-state (none|all visible|all)
      if (shortcut.checkbox.show) {
        $parent.on("change", ".tick_all", function (e) {
          var checkbox = e.target,
            label =  checkbox.previousSibling;

          if (checkbox.checked) {
            if (checkbox.indeterminate === false) {
              checkbox.setAttribute("flag", true);
            }
          } else {
            if (checkbox.getAttribute("flag")) {
              checkbox.removeAttribute("flag");
              checkbox.indeterminate = true;
              checkbox.checked = true;
              label.className = label.className.replace(priv.filterForClass("ui-icon-checkbox-on"), ' ui-icon-globe');
              e.preventDefault();
              return false;
            } else {
              checkbox.indeterminate = false;
              label.className = label.className.replace(priv.filterForClass("ui-icon-globe") , '');
            }
          }
        });
      }

      // sorting 5-states (none|abc_asc|123_asc|abc_desc|123_desc)
      if (shortcut.sorting) {
        $parent.on("click", "a.ui-sorting", function (e) {
          var button = e.target,
            direction = button.getAttribute("data-direction"),
            swapSortingState = function (direction, prev, next) {
              button.setAttribute("data-direction", direction);
              button.setAttribute("data-icon", next);
              button.className = button.className.replace(
                priv.filterForClass("ui-icon-" + prev), " ui-icon-" + next
              );
            };

          switch (direction) {
          case "descending_abc":
            // parameters state | previous icon | new icon
            swapSortingState(
              "descending_123",
              "sort-by-alphabet-alt",
              "sort-by-order-alt"
            );
          break;
          case "descending_123":
            swapSortingState(
              "ascending_abc",
              "sort-by-order-alt",
              "sort-by-alphabet"
            );
          break;
          case "ascending_abc":
            swapSortingState(
              "ascending_123",
              "sort-by-alphabet",
              "sort-by-order"
            );
          break;
          case "ascending_123":
            swapSortingState(
              undefined,
              "sort-by-order",
              "sort"
            );
          break;
          default:
            swapSortingState(
              "descending_abc",
              "sort",
              "sort-by-alphabet-alt"
            );
          break;
          }
        });
      }

      // or la viola - we touch the DOM once!!
      // TODO: not slottable as of now!
      if (internal) {
        return fragment_container;
      } else {
        $parent.empty().append( fragment_container ).enhanceWithin();
      }

    } else {
      // works...not!
      element.appendChild(priv.generateElement("tbody")
        .appendChild(priv.generateElement("tr")
            .appendChild(priv.generateElement("td",
              {},{},{"text":"Error: No configuration available for this type of data!"}
            )
          )
        )
      );
    }
  };

  /*
   * Generates a table header based on configuration and portal_type
   * @method generateTableHeader
   * @param {object} settings Configuration for table to create
   * @param {string} portal_type The portal type for this element
   */
  // TODO: single row ok. multi row to make
  priv.generateTableHeader = function (settings, portal_type) {
    var k,
      l,
      cell,
      field,
      config,
      field_config,
      property,
      keys,
      title,
      temp = {},
      set,
      check = settings.configuration.checkbox.show,
      merger = settings.configuration.build_to_merge.show,
      target = settings.view,
      table_header = priv.generateElement("thead"),
      row = priv.generateElement("tr");

    // tickbox - all
    if (check) {
      cell = priv.generateElement("th",{},{},{});
      cell.appendChild(priv.generateElement("label",
        {},
        {"for": portal_type + "_tick_all"},
        {"text":"Select All"}
      ));
      cell.appendChild(priv.generateElement("input",
        {
          "className": "tick_all",
          "type":"checkbox",
          "id": portal_type + "_tick_all",
          "name": portal_type + "_tick_all",
          "value":"Select All/Unselect All"
        },
        {"data-iconpos":"notext"},
        {}
      ));
      row.appendChild( cell );
    }

    // reverse columns so they are mergeable :-)
    if (merger) {
      target = priv.reverseArray(target);
    }

    for (l = 0; l < target.length; l += 1) {
      field = target[l];
      config = {};
      property = field.title;
      field_config = {};

      if (field.show) {
        // fetch field_config. This should be loaded by now, because
        // we want to display a certain portal_type and to do so,
        // we need all the field configurations associated with this
        // portal_type config["data-i18n":
        field_config = priv.field_definitions[portal_type][property];

        if (field.merge === undefined) {
          if (field_config) {
            config["data-i18n"] = field_config.widget.title_i18n;
          }
          if (field.persist === undefined) {
            config["data-priority"] = field.priority || 6;
          }
          if (settings.configuration.sorting && field.sort) {
            config["data-sorting"] = "true";
          }
          if (field_config) {
            title = temp[property] || field_config.widget.title;
          } else {
            title = priv.capitaliseFirstLetter(property);
          }

          cell = priv.generateElement(
            "th",
            {"className":"translate"},
            config,
            {"text": title }
          );
          if (merger) {
            row.insertBefore(cell, (set === undefined ? undefined : row.childNodes[check ? 1 : 0]) );
            set = true;
          } else {
            row.appendChild(cell);
          }
        } else {
          temp[property] = field.merge_title;
        }
      }
    }
    table_header.appendChild( row );

    return table_header;
  };

  /*
   * Generate table rows based on configuration and data provided. Needed
   * to switch between editable and readonly table rows
   * @method generateTableRow
   * @param {object} settings Configuration for table row to create
   * @param {object} item Data for this table row
   * @param {string} portal_type The portal type for the object displayed
   * @returns table_row
   */
  priv.generateTableRow = function (settings, item, portal_type) {
    var k,
      l,
      row,
      cell,
      property,
      field,
      link,
      value,
      fetch_value,
      button,
      logic,
      temp,
      target,
      keys,
      check,
      action_menu,
      action_controls,
      set;

    temp = {};
    row = priv.generateElement("tr");
    target = settings.view;
    check = settings.configuration.checkbox.show,
    merger = settings.configuration.build_to_merge.show;

    // tickbox
    if (check) {
      cell = priv.generateElement("th",{},{},{});
      cell.appendChild(priv.generateElement("label",
        {"for":item._id},{},{"text":"Select " + item.title}
      ));
      cell.appendChild(priv.generateElement("input",
        {"className":"select_all", "type":"checkbox", "id":item._id, "name":item._id, "value":"Select All/Unselect All"},
        {"data-iconpos":"notext"},
        {}
      ));
      row.appendChild(cell);
    }

    // reverse if mergable columns
    if (merger) {
      console.log("NO merger");
      target = priv.reverseArray(target);
    }

    // loop fields to display
    for (l = 0; l < target.length; l += 1) {
      field = target[l];
      property = field.title;
      value = item[property];

      if (field.show) {
        if (field.merge === undefined) {
          cell = priv.generateElement("td",{},{},{});
          link = "object.html?type=" + portal_type + "&mode=edit" + "&item=" + item._id;

          // TODO: crap...refactor whole section
          // fetch non portal_type values
          if (value === undefined && field.action === false) {
            fetchValue = priv.getERP5property(item._id, field.lookup);
            if (fetchValue.error) {
              value = "N/A";
            }
          }

          if (field.export) {
            if (item.export.buttons.length > 0) {
              action_menu = priv.generateControlgroup(item.export, portal_type);
              cell.appendChild(action_menu);
            }
          } else if (field.status) {
              cell.appendChild(priv.generateLinkButton(
                {
                "type":"a",
                "direct": {
                  "href": link,
                  "className": "status error ui-btn-inline ui-btn translate responsive ui-btn-icon-left ui-shadow ui-corner-all ui-icon-bolt"
                },
                "attributes": {
                  "data-role":"button",
                  "data-enhanced":"true",
                  "data-iconpos":"notext",
                  "data-i18n": "[title:" + item.status.message_i18n + ";" + item.status.error_i18n + "]",
                  "data-icon":"bolt",
                  "title": item.status.message
                },
                "logic": {"text": item.status.state}
                }
              ));
          } else {
            // default
            if (field.image) {
              logic = {"img": item.image}
            } else {
              // TODO: lame merge
              if (temp[property]) {
                value += " " + temp[property];
                //delete temp[property];
              }
              logic = {"text":value}
            }

            // TODO: a link in every cell? binding?
            // don't touch this just for some status
            if (settings.configuration.link_to_records.show) {
              cell.appendChild(priv.generateElement(
                "a",
                {"className": "table_link", "href": link},
                {},
                logic
              ));
            } else {
              cell.appendChild(priv.generateElement("span", {}, {}, logic));
            }
          }
          // Grrr...
          if (merger) {
            row.insertBefore(cell, (set === undefined ? undefined : row.childNodes[check ? 1 : 0]) );
            set = true;
          } else {
            row.appendChild(cell);
          }
        } else {
          // keep the value of cells to be merged
          temp[field.merge] = value;
        }
      }
    }
    return row;
  };

  /*
   * Generates a table body based on configuration and data provided from JIO
   * @method generateTableBody
   * @param {object} settings Configuration for table body to create
   * @param {object} answer from JIO
   * @param {string} portal_type The portal type for this element
   * @returns {object} table_body
   */
  priv.generateTableBody = function (settings, answer, portal_type) {
    var l,
      row,
      item,
      property,
      field,
      error,
      table_body = priv.generateElement("tbody",{},{},{});

    // data
    // we HACK
    if (answer === undefined) {
      answer = priv.getFakeRecords[portal_type];
    }
    if (answer && answer.length > 0) {
      for (l = 0; l < answer.length; l += 1) {
        item = answer[l].doc;
        row = priv.generateTableRow(settings, item, portal_type);
        table_body.appendChild(row);
      }
    } else {
      // error or 0 results
      row = priv.generateElement("tr");
      l = 0;

      if (answer === undefined) {
        error = "Error retrieving Data";
      } else if (answer.length === 0 ) {
        error = "No records found. Please modify your search!";
      }

      if (settings.configuration.checkbox.show) {
        l += 1;
      }
      for (property in settings.view) {
        if (settings.view.hasOwnProperty(property)) {
          field = settings.view[property];
          if (field.show) {
            l += 1;
          }
        }
      }
      row.appendChild(priv.generateElement("th",
        {"style":"text-align: center; line-height: 2em;"},
        {"colspan":l},
        {"text": error}
      ));
      table_body.appendChild(row);
    }
    return table_body;
  };


  /* ********************************************************************** */
  /*                                 action menu                            */
  /* ********************************************************************** */
  /*
   * Creates a controlgroup (just a passthrough method)
   * @constructActionMenu
   * @param {object} element Wrapper element
   * @returns {object} document fragment
   */
  priv.constructActionMenu = function (element) {
    var gadget_id = element.getAttribute("data-gadget-id"),
      settings = priv.gadget_properties[gadget_id],
      portal_type = settings.portal_type_title,
      $parent = $(element.parentNode);
      fragment = priv.generateControlgroup(settings.layout);

    $(element.parentNode).empty().append( fragment ).enhanceWithin();
  };


  /* ********************************************************************** */
  /*                                 list view                              */
  /* ********************************************************************** */
  /**
    * Create a list of elements
    * @method generateListview
    * @param {object} config Configuration for list to create
    * @param {string} internal Create internally or not
    * @returns {object} document fragment
    */
  // TODO: Work-in-progress
  priv.generateListview = function (config, internal) {
    var i, item_config, item, list, target, skip;

    list = priv.generateElement(
      "ul",
      {"className": (config.class || "") + "listview"},
      {"data-theme": config.theme},
      {"data-role": config.role ? "listview" : null}
    );

    for (i = 0; i < config.items.length; i += 1) {
      item_config = config.items[i];
      if (item_config.type === "divider") {
        item = priv.generateElement(
          "li",
          {
            "className": "ui-li-divider ui-bar-" + config.theme +
              (i === 0 ? " ui-first-child" : "")
          },
          {
            "data-role":"list-divider",
            "role":"heading",
            "data-i18n": item_config.text_i18n
          },
          {"text": item_config.text}
        );
      } else {
        item = priv.generateElement(
          "li",
          {
            "className": "listview_item " +
              ((item_config.left && item_config.left.icon) ? "listview_icon " : "") +
                (i === config.items-1 ? "ui-last-child" : "")
          }
        );
        // link or no link
        if (item_config.middle.href) {
          if (config.role) {
            target = priv.generateElement(
              "a",
              {
                "href": item_config.middle.href,
                "className": "ui-btn ui-btn-icon-right " + (item_config.right ? item_config.right.icon : "ui-icon-carat-r")
              }
            );
          } else {
            target = priv.generateElement(
              "a",
              {"href": item_config.middle.href}
            );
          }
        } else {
          // not done yet
          skip = true;
          target = item;
        }

        if (item_config.left && item_config.left.icon) {
          target.appendChild(priv.generateElement(
            "span",
            {
              "className":"ui-li-icon ui-li-icon-custom ui-icon-" + item_config.left.icon + " ui-icon",
              "innerHTML": "&nbsp;"
            }
          ));
        }
        if (item_config.middle.title) {
          target.appendChild(priv.generateElement(
            "h3",
            {},
            {"data-i18n": item_config.middle.title_i18n},
            {"text": item_config.middle.title}
          ));
        }
        if (item_config.middle.subtitle) {
          target.appendChild(priv.generateElement(
            "p",
            {},
            {"data-i18n": item_config.middle.subtitle_i18n},
            {"text": item_config.middle.subtitle}
          ));
        }
        if (item_config.middle.info) {
          target.appendChild(priv.generateElement(
            "span",
            {},
            {"data-i18n": item_config.middle.info_i18n},
            {"text":item_config.middle.info}
          ));
        }
        if (skip === undefined) {
          item.appendChild(target);
        }
      }
      list.appendChild(item);
    }

    return list;
  };



  /* ====================================================================== */
  /*                                 SETUP                                  */
  /* ====================================================================== */
  // NOTE: custom, content generation methods = non generic stuff needed to
  // display custom content. Above this section = generic, below = custom


  /* ********************************************************************** */
  /*                       table search/config methods                      */
  /* ********************************************************************** */
  /**
    * generates a popup contents
    * @method generatePopupContents
    * @param  {object} e Event that triggered opening a popup
    * @param  {string} type Pointer to object holding popup config info
    * @param  {string} portal_type To be loaded and referenced
    * @param  {object} view gadget Configuration properties (pass through)
    * @oaram  {string} gadget_id
    */
  priv.generatePopupContents = function (e, type, portal_type, view, gadget_id) {
    var property,
      i,
      field,
      popup_body,
      popup_content,
      popup_message,
      popup_title,
      popup_info,
      popup_method,
      element,
      reference,
      popup = document.getElementById(e.target.href.split("#")[1]),
      state = popup.getAttribute("data-state");

    switch(type) {
      case "self":
        reference = e.target.getAttribute("data-reference");
        // portal_type should be defined
      break;
      case "action":
        element = e.target.parentNode.getElementsByTagName("input")[0];
        reference = element.getAttribute("data-reference");
        portal_type = element.getAttribute("data-relation");
      break;
    };

    // only regenerate the popup if switching content
    if (state !== reference) {
      popup_body = document.createDocumentFragment();
      switch (reference) {
        // NOTE: table wrapper configure menu
        // TODO: a global dump for reusable button config would be nice!
        case "configure":
          popup_title = "Configuration";
          popup_info = "Please select columns to display and priority of display on smaller screens (6-1). Drag columns to modify the order of display"
          popup_methods = ["generatePortalTypeFieldSelector", "generateDefaultColumnConfig"];
          popup_footer = {
            "type": "controlgroup",
            "direction": "horizontal",
            "class": "ui-grid ui-table-wrapper-bottom ui-table-wrapper-inset ui-corner-all",
            "controls_class": "ui-grid-3",
            "buttons": [
              {
                "type": "a",
                "direct": {"className": "ui-grid-button ui-link ui-btn ui-icon-remove ui-btn-icon-right ui-shadow ui-corner-all ui-first-child"},
                "attributes": {"data-i18n": "", "data-enhanced":"true", "data-role": "button", "data-iconpos": "right", "data-icon":"remove", "data-rel": "back"},
                "logic": {"text":"Cancel"}
              }, {
                "type": "a",
                "direct": {"className": "ui-grid-button table_action ui-link ui-btn ui-icon-refresh ui-btn-icon-right ui-shadow ui-corner-all"},
                "attributes": {"data-i18n": "", "data-enhanced":"true", "data-role": "button", "data-iconpos": "right", "data-icon":"refresh", "data-action": "rest"},
                "logic": {"text":"Reset"}
              }, {
                "type": "a",
                "direct": {"className": "ui-grid-button table_action ui-btn-active ui-link ui-btn ui-icon-save ui-btn-icon-right ui-shadow ui-corner-all ui-last-child"},
                "attributes": {"data-i18n": "generic.buttons.save", "data-role": "button", "data-iconpos": "right", "data-icon":"save", "data-action": "save"},
                "logic": {"text":"Save"}
              }
            ]
          };
          popup_action = "add_criteria_config";
          popup_hint = "Add Columns";
        break;
        // NOTE: table wrapper detail search
        case "details":
          popup_title = "Detail Search";
          popup_info = "Create a multi field search by adding fields below. For faster lookups, you can save your search criteria if needed."
          popup_methods = ["generatePortalTypeFieldSelector"];
          popup_footer = {
            "type": "controlgroup",
            "direction": "horizontal",
            "class": "ui-grid ui-table-wrapper-bottom ui-table-wrapper-inset ui-corner-all",
            "controls_class": "ui-grid-2",
            "buttons": [
              {
                "type": "a",
                "direct": {"className": "ui-grid-button ui-link ui-btn ui-icon-remove ui-btn-icon-right ui-shadow ui-corner-all ui-first-child"},
                "attributes": {"data-i18n": "", "data-enhanced":"true", "data-role": "button", "data-iconpos": "right", "data-icon":"remove", "data-rel": "back"},
                "logic": {"text":"Cancel"}
              }, {
                "type": "a",
                "direct": {"className": "ui-grid-button table_action ui-btn-active ui-link ui-btn ui-icon-search ui-btn-icon-right ui-shadow ui-corner-all ui-last-child"},
                "attributes": {"data-i18n": "", "data-enhanced":"true", "data-role": "button", "data-iconpos": "right", "data-icon":"search", "data-action": "search"},
                "logic": {"text":"Search"}
              }
            ]
          };
          popup_action = "add_criteria_search";
          popup_hint = "Select Search Criteria";
        break;
      }
      // header
      if (popup_title) {
        popup_body.appendChild(priv.generateHeader({"title":popup_title}));
      }
      // content
      popup_content = priv.generateElement("div", {"className":"ui-content"},{"data-role":"content"},{});
      if (popup_info) {
        popup_content.appendChild(priv.generateElement("p", {},{},{"text": popup_info || null}));
      }
      // data
      for (i = 0; i < popup_methods.length; i += 1) {
        popup_content.appendChild( priv[popup_methods[i]]( view, gadget_id, popup_action, popup_hint ) );
      }
      popup_body.appendChild( popup_content);
      // footer
      if (popup_footer) {
        popup_body.appendChild( priv.generateFooter(popup_footer));
      }
      popup.setAttribute("data-state", reference);
      popup.setAttribute("data-type", portal_type);

      // empty popup
      popup.innerHTML = "";

      // add content directly
      $(popup).append( popup_body ).enhanceWithin();
    }
  };

  /**
  * generates a detail search field for the portal_type
  * @method generatePortalTypeFieldSelector
  * @param  {object} table The table configuration
  * @return {object} element The element fragment
  */
  priv.generatePortalTypeFieldSelector = function (table, gadget_id, action, hint) {
    var controls,
      property,
      config,
      unique_field_name,
      all_options = [];

    for (property in table) {
      if (table.hasOwnProperty(property)) {
        field = table[property];
        unique_field_name = "search_" + gadget_id + "_" + property;
        all_options.push({
          "value":gadget_id + ":" + property,
          "text": priv.capitaliseFirstLetter(property)
        });
      }
    }

    controls = priv.generateElement("div",
      {"className":"ui-controlgoup ui-controlgroup-horizontal ui-popup-menu"},
      {"data-role":"controlgroup", "data-type":"horizontal"},
      {}
    );
    controls.appendChild(priv.generateElement("label",
      {"className": "ui-hidden-accessible"},{"for": action + "_" + gadget_id}, {"text": hint}
    ));
    controls.appendChild(priv.generateElement("select",
      {"name": action + "_" + gadget_id, "id": action + "_" + gadget_id },
      {},
      {"options": all_options}
    ));
    controls.appendChild(priv.generateElement("a",
      {"className": "responsive ui-btn-active table_action"},
      {"data-role":"button", "data-iconpos":"right", "data-icon":"plus", "data-action":action},
      {"text":"Add"}
    ));
    return controls;
  };

  /**
  * generates a grid configuration entry
  * @method generateConfigCriteria
  * @param  {object} element clicked element
  */
  priv.generateConfigCriteria = function (element, id, prop) {
    var field,
      property,
      grid,
      cell,
      i,
      unique_field_name,
      prev,
      val,
      portal_type,
      property;

    if (typeof element === "object") {
      prev = element.previousSibling.getElementsByTagName("select")[0],
      val = prev.options[prev.selectedIndex].value,
      gadget_id = val.split(":")[0],
      property = val.split(":")[1];
    } else {
      val = "skip";
      gadget_id = id;
      property = prop;
    }

    if (val === "" || val === undefined) {
      alert("Please select a valid column!");
    } else {
       // look up field in gadget_id, generate grid and add it to form
      field = priv.gadget_properties[gadget_id].view[property];

      if (field) {
        unique_field_name = "configure_" + gadget_id + "_" + property;

        grid = priv.generateElement("div",
          {"className":"ui-grid-d ui-grid-row"}, {}, {"grid":5}
        );

        for (i = 0; i < grid.childNodes.length; i += 1) {
          cell = grid.childNodes[i];
          switch(i) {
            case 0:
              cell.className = "ui-block-a ui-grid-title";
              cell.appendChild(priv.generateElement("span",
                {}, {}, {"text": priv.capitaliseFirstLetter(property)}
              ));
            break;
            case 1:
              cell.className = "ui-block-b";
              cell.appendChild(priv.generateElement("label",
                {"className": "ui-hidden-accessible"},
                {"for": unique_field_name + "_priority"},
                {"text": "Set priority"}
              ));
              cell.appendChild(priv.generateElement("input",
                {
                "name": unique_field_name + "_priority",
                "id": unique_field_name + "_priority",
                "min":1,
                "max":6,
                "type":"number",
                "value": field.priority || ""
                },
                {"data-mini": "true"},
                {"disabled": field.priority === undefined ? "disabled" : null}
              ));
            break;
            case 2:
              cell.className = "ui-block-c";
              cell.appendChild(priv.generateElement("label",
                {"className": "ui-hidden-accessible"},
                {"for": unique_field_name + "_toggle"},
                {"text": "Set visibility"}
              ));
              cell.appendChild(priv.generateElement("select",
                {"name": unique_field_name + "_toggle", "id": unique_field_name + "_toggle"},
                {"data-mini": "true", "data-role":"slider"},
                {
                  "disabled": field.priority === undefined ? "disabled" : null,
                  "options": [
                    {"text": "Show", "value": "on", "selected": field.show ? "selected": null},
                    {"text": "Hide", "value": "off", "selected": field.show ? "selected": null}
                  ]
                }
              ));
            break;
            case 3:
              cell.className = "ui-block-d";
              cell.appendChild(priv.generateElement(
                "label",
                {"className": "ui-hidden-accessible"},
                {"for": unique_field_name + "_sort"},
                {"text": "Set sorting"})
              );
              cell.appendChild(priv.generateElement("select",
                {"name": unique_field_name + "_sort", "id": unique_field_name + "_sort"},
                {"data-mini": "true", "data-role":"slider"},
                {
                  "disabled": field.priority === undefined ? "disabled" : null,
                  "options": [
                    {"text": "Sort", "value": "on", "selected": field.show ? "selected": null},
                    {"text": "Static", "value": "off", "selected": field.show ? "selected": null}
                  ]
                }
              ));
            break;
            case 4:
              cell.className = "ui-block-e ui-grid-action";
              cell.appendChild(priv.generateElement("a",
                {"className":"table_action"},
                {"data-role":"button", "data-icon":"delete", "data-iconpos":"notext", "data-action":"delete_criteria"},
                {"text":"Delete"}
              ));
            break;
          };
        }

        return grid;
      } else {
        alert("Field name does not exist in field defition list!");
      }
    }
  };

  /**
  * generates a grid search criteria entry
  * @method generateSearchCriteria
  * @param  {object} element clicked element
  */
  priv.generateSearchCriteria = function (element) {
    var grid,
      cell,
      opts = [],
      i,
      j,
      field,
      new_form,
      prev = element.previousSibling.getElementsByTagName("select")[0],
      val = prev.options[prev.selectedIndex].value,
      portal_type = val.split(":")[0],
      property = val.split(":")[1],
      form = $( element ).closest(".ui-popup").find("form");

    // form should be create here instead to keep column selector generic
    if (form.length === 0) {
      new_form = document.createElement("form");
    }
    if (val === "" || val === undefined) {
      alert("Please select a valid criteria!");
    } else {
      // look up field in portal_type, generate grid and add it to form
      field = priv.gadget_properties[portal_type].view[property];

      if (field) {

        grid = priv.generateElement("div",
          {"className":"ui-grid-d ui-grid-row"}, {}, {"grid":4}
        );

        for (i = 0; i < grid.childNodes.length; i += 1) {
          cell = grid.childNodes[i];
          switch(i) {
            case 0:
              cell.className = "ui-block-a ui-grid-title";
              cell.appendChild(priv.generateElement("span",
                {}, {}, {"text": priv.capitaliseFirstLetter(property)}
              ));
            break;
            case 1:
              cell.className = "ui-block-b ui-grid-search";
              if (field.search !== undefined) {
                cell.appendChild(priv.generateElement("label",
                  {"className": "ui-hidden-accessible"},
                  {"for": "run_search_" + portal_type + "_" + property},
                  {"text": "Search Term"})
                );
                switch(field.search.type) {
                  case "text":
                    cell.appendChild(priv.generateElement("input",
                      {
                        "name": "run_search_" + portal_type + "_" + property,
                        "id": "run_search_" + portal_type + "_" + property,
                        "type": field.search.type
                      },
                      {"data-clear-btn": "true"}
                    ));
                  break;
                  case "select":
                    for (j = 0; j < field.search.options.length; j += 1) {
                      if (j === 0) {
                        opts.push({"value":"","text":"", "selected":"selected"})
                      }
                      opts.push({"value":field.search.options[j], "text":field.search.options[j]})
                    }
                    cell.appendChild(priv.generateElement("select",
                      {"name": "run_search_" + portal_type + "_" + property, "id": "run_search_" + portal_type + "_" + property,},
                      {},
                      {"options": opts}
                    ));
                  break;
                }
              }
            break;
            case 2:
              cell.className = "ui-block-c ui-grid-search";
              if (field.search !== undefined) {
                cell.appendChild(priv.generateElement("label",
                  {"className": "ui-hidden-accessible"},
                  {"for": "run_search_finetune_" + portal_type + "_" + property},
                  {"text": "Specify"})
                );
                switch(field.search.subsearch) {
                  case "flip":
                    for (i = 0; i < field.search.options.length; i += 1) {
                      opts.push({"value":field.search.options[i], "text":field.search.options[i], "selected": i === 0 ? "selected" : null})
                    }
                    cell.appendChild(priv.generateElement("select",
                      {"name": "run_search_finetune_" + portal_type + "_" + property, "id": "run_search_finetune_" + portal_type + "_" + property},
                      {"data-mini":"true", "data-role":"slider"},
                      {"options": opts}
                    ));
                  break;
                  case "checkbox":
                    cell.lastChild.className = "";
                    cell.appendChild(priv.generateElement("input",
                      {
                        "name":"run_search_finetune_" + portal_type + "_" + property,
                        "id":"run_search_finetune_" + portal_type + "_" + property,
                        "type":"checkbox",
                        "value": field.search.value
                      },
                      {"data-mini":"true"},
                      {}
                    ));
                  break;
                };
              }
            break;
            case 3:
              cell.className = "ui-block-e ui-grid-action";
              cell.appendChild(priv.generateElement("a",
                {"className":"table_action"},
                {"data-role":"button", "data-icon":"delete", "data-iconpos":"notext", "data-action":"delete_criteria"},
                {"text":"Delete"}
              ));
            break;
          }
        }

        // first row
        if (form.length === 0) {
          new_form.appendChild(grid);
          return new_form;
        }
        // other rows
        return grid;
      } else {
        alert("Field name does not exist in field defition list!");
      }
    }
  };

  /**
    * generates a configuration form for the portal_type
    * @method generateDefaultColumnConfig
    * @param  {object} table The table configuration
    * @return {object} element The element fragment
    */
  priv.generateDefaultColumnConfig = function (table, gadget_id) {
    var element = priv.generateElement("form",
      {"className": "draggable"}, {"data-sortable":"true"}, {}
    );

    for (property in table) {
      if (table.hasOwnProperty(property)) {
        field = table[property];
        if (field.show) {
          element.appendChild(priv.generateConfigCriteria("none", gadget_id, property));
        }
      }
    }

    return element;
  };

  /* ********************************************************************** */
  /*                             menu panel                                 */
  /* ********************************************************************** */
  /**
  * Generates panel
  * @method generatePanel
  * @param  {object} config JSON configuration
  * @return {object} HTML fragment
  */
  // NOTE: panels cannot be done pre-enhanced, so there will be no generic
  // panel generation function at this moment. Below is the panel that is
  // currently used.
  priv.generatePanel = function (config) {
    var i, element, search, modules, panel;

    panel = priv.generateElement(
      "div",
      {"className":"panel", "id":"menu"},
      {
        "data-role":"panel",
        "data-theme":config.theme,
        "data-position":"left",
        "data-display":"push",
        "data-position-fixed": true
      }
    );

    for (i = 0; i < config.elements.length; i += 1) {
      element = config.elements[i];

      switch (element.type) {
        case "globalsearch":
          // no config for global search
          search = priv.generateElement(
            "div", {"className":"panel_element panel_element_first panel_header"}
          );
          search.appendChild(priv.generateElement(
            "input",
            {"type":"search", "className": "panel_search"},
            {
              "value":"",
              "data-role":"button",
              "placeholder":"Search",
              "data-i18n":"[placeholder]generic.text.search;generic.text.search"
            }
          ));
          search.appendChild(priv.generateElement(
            "a",
            {
              "href":"",
              "className":"panel-close ui-icon-remove ui-btn ui-btn-icon-notext ui-shadow ui-corner-all"
            }, {
              "data-role":"button",
              "data-iconpos":"notext",
              "data-icon":"remove",
              "data-rel":"close"
            },
            {"text":"Close"}
          ));
          panel.appendChild(search);
        break;
        case "listmenu":
          modules = priv.generateElement(
            "div", {"className":"panel_element"}
          );
          // NOTE: generateListview is a JQM widget constructor function
          // which should be in a global constructor gadget along with
          // all other element generator functions
          modules.appendChild(priv.generateListview(element));
          panel.appendChild(modules);
        break;
      }
    }

    return panel;
  };

  /* ********************************************************************** */
  /*                             login popup                                */
  /* ********************************************************************** */
  // NOTE: This should be loaded as the HTML content of a login gadget
  // TODO: convert to JSON configuration!

  /**
  * Generates the content of the login popup
  * @method generateLoginPopup
  * @return {object} HTML fragment
  */
  priv.generateLoginPopup = function () {
    var popup_element,
      external,
      // NOTE: in case we need a classic login (yet again) uncomment below
      //internal,
      //form,
      //note,
      p,
      img,
      content,
      info,
      hint = document.createDocumentFragment(),
      login_form = document.createDocumentFragment(),
      popup_content = document.createDocumentFragment(),

    img = priv.generateElement(
      "div", {"className": "popup_element logo_wrap"}
    );
    img.appendChild(priv.generateElement(
      "img", {"src":"img/slapos.png", "alt": "slapos logo"}
    ));
    popup_content.appendChild(img);

    login_form.appendChild(priv.generateElement(
      "p",{},{},{"text":"Sign in using"}
    ));
    external = priv.generateElement(
      "div",
      {"className":"ui-controlgroup"},
      {"data-role":"controlgroup"}
    );
    //internal = external.cloneNode();
    external.appendChild(priv.generateElement(
      "a",
      {"href":"#", "className":"signin_google ui-link ui-btn ui-icon-google-plus-sign ui-btn-icon-left ui-first-child"},
      {"data-role":"button", "data-icon":"google-plus-sign", "data-iconpos":"left", "data-enhanced":"true"},
      {"text":"Google"}
    ));
    external.appendChild(priv.generateElement(
      "a",
      {"href":"#", "className":"signin_fb ui-link ui-btn ui-icon-facebook-sign ui-btn-icon-left"},
      {"data-role":"button", "data-icon":"facebook-sign", "data-iconpos":"left", "data-enhanced":"true"},
      {"text":"Facebook"}
    ));
    external.appendChild(priv.generateElement(
      "a",
      {"href":"#", "className":"signin_browser ui-link ui-btn ui-icon-lock ui-btn-icon-left ui-last-child"},
      {"data-role":"button", "data-icon":"lock", "data-iconpos":"left", "data-enhanced":"true"},
      {"text":"Browser ID"}
    ));
    login_form.appendChild(external);
//     // classic login
//     login_form.appendChild(priv.generateElement(
//       "p", {},{},{"text":"Classic Login"}
//     ));
//     form = priv.generateElement("form");
//     internal.appendChild(priv.generateElement(
//       "label",
//       {"className":"ui-hidden-accessible"},
//       {"for":"login", "data-i18n":"generic.text.login"},
//       {"text":"Login"}
//     ));
//     internal.appendChild(priv.generateElement(
//       "input",
//       {"name":"login", "id":"login", "type":"text"},
//       {
//         "placeholder":"Login",
//         "data-icon":"user",
//         "data-i18n":"[placeholder]generic.text.login;generic.text.login"
//       }
//     ));
//     internal.appendChild(priv.generateElement(
//       "label",
//       {"className":"ui-hidden-accessible"},
//       {"for":"password","data-i18n":"generic.text.password"},
//       {"text":"Password"}
//     ));
//     internal.appendChild(priv.generateElement(
//       "input",
//       {"name":"password", "id":"password", "type":"password"},
//       {
//         "placeholder":"Password",
//         "data-icon":"lock"
//         "data-i18n":"[placeholder]generic.text.password;generic.text.password"
//       }
//     ));
//     internal.appendChild(priv.generateElement(
//       "label",
//       {"className":"ui-hidden-accessible"},
//       {"for":"submit","data-i18n":"generic.text.go"},
//       {"text":"Go"}
//     ));
//     internal.appendChild(priv.generateElement(
//       "input",
//       {
//         "className":"submit_form",
//         "name":"submit",
//         "id":"submit",
//         "type":"button",
//         "value":"submit"},
//       {"data-i18n":"[placeholder]generic.text.go;generic.text.go"}
//     ));
//     form.appendChild(internal);
//     login_form.appendChild(form)
//     note = priv.generateElement(
//       "span", {"className":"mini right note"}
//     );
//     note.appendChild(
//       priv.generateElement(
//       "a", {"href":"#"},{},{"text":"Forgot Password"}
//       )
//     );
//     login_form.appendChild(note);
    content = priv.generateElement(
      "div", {"className": "popup_element"}
    );
    content.appendChild(login_form);
    popup_content.appendChild(content);
    p = priv.generateElement("p", {"className":"mini"});
    p.appendChild(
      priv.generateElement(
        "span", {"className":"note"},{},{"text":"Please note:"}
      )
    );
    p.appendChild(
      priv.generateElement(
        "span",
        {
          "innerHTML":"To maintain sufficient resources, a minimal fee of 1 " +
          "EUR will be charged if you use SlapOS services for <strong>more " +
          " than 24 hours</strong>. By clicking on one of the signup " +
          "buttons, you agree that you are subscribing to a payable service." +
          " All services you request will be invoiced to you at the end of" +
          " the month."
        }
      )
    );
    hint.appendChild(p);
    hint.appendChild(priv.generateElement(
      "p", {},{},{"text":"To find out more, please refer to"}
    ));
    hint.appendChild(priv.generateElement(
      "a",
      {
        "href":"#",
        "className":"ui-btn ui-btn-icon-left ui-icon-eur ui-shadow ui-corner-all"
      },
      {"data-i18n":"generic.text.pricing"},
      {"text":"SlapOS Pricing"}
    ));

    info = priv.generateElement(
      "div", {"className": "popup_element"}
    );
    info.appendChild(hint);
    popup_content.appendChild(info);

    return popup_content;
  };


  /* ====================================================================== */
  /*                             INITIALIZATION                             */
  /* ====================================================================== */
  // NOTE: this should be done in the respective gadgets
  // WARNING: - less bindings = more performance
  //          - bindings far away from delegate target = less performance
  //          - $(document).on("click", ".far_away", function... not good
  //          - beware of binding multiple times (JQM keeps active DOM)
  //          - namespace bindings with a className to selectively unbind
  //          - clean up behind you. Unneeded bindings should be off-ed

  // GLOBAL SET UP
  // this will set a global panel, login popup, footer and header which
  // will persist across all pages.
  $(document).on("pagebeforeshow.init", "div.ui-page", function (e) {
    var pop = document.getElementById("global_popup"),
      popupConfig = priv.gadget_properties["application_popup"],
      headerConfig = priv.gadget_properties["application_header"],
      footerConfig = priv.gadget_properties["application_footer"],
      panelConfig = priv.gadget_properties["application_menu"],
      set = priv.testForClass(document.documentElement.className, "init");

    // global application setter
    if (!set) {
      document.documentElement.className += " init";

      // pop
      if (popupConfig) {
        document.body.appendChild(priv.generatePopup(popupConfig));

        // NOTE: before the popup is positioned the content to display is
        // retrieved from data-reference and set to data-state. Opening the
        // same popup will not rebuild it's content. Content generated once
        // will be cached unless data-rebuild is set on the popup
        $("#global_popup").on("popupbeforeposition", function(e, ui) {
          var fragment,
            store,
            pop = e.target,
            rebuild = pop.getAttribute("data-rebuild"),
            reference = pop.getAttribute("data-reference"),
            state = pop.getAttribute("data-state");

          // check chache
          if (priv.fragment_cache[reference] === undefined) {
            store = true;
          }

          // don't reload if nothing changed
          // NOTE: share across everything!
          if (state !== reference) {
            if (store || rebuild === undefined) {
              fragment = priv["generate" + priv.capitaliseFirstLetter(reference) + "Popup"]();
              // cache
              priv.fragment_cache[reference] = fragment;
            } else {
              fragment = priv.fragment_cache[reference];
            }
            pop.innerHTML = "";
            pop.setAttribute("data-state", reference);
            $(pop).append( fragment ).enhanceWithin();
          }
        });
      }

      // NOTE: must be before global toolbars!
      if (panelConfig) {
        document.body.appendChild(priv.generatePanel(panelConfig));
      }
      if (footerConfig) {
        document.body.appendChild(priv.generateFooter(footerConfig));
      }
      if (headerConfig) {
        document.body.appendChild(priv.generateHeader(headerConfig));
      }

      // NOTE: update layout and set .... hey Romain: bindings!
      $(document)
        .enhanceWithin()
        .off(".init")

        // global popup handler & content shuffle/caching
        .on("click", ".toggle_global_popup", function (e) {
          var link = e.target,
            reference = link.getAttribute("data-reference"),
            rebuild = link.getAttribute("data-rebuild"),
            id = link.getAttribute("href").replace("#",""),
            pop = document.getElementById(id),
            state = pop.getAttribute("data-reference");

          if (reference !== state) {
            pop.setAttribute("data-reference", reference);
          }
          // force rebuild of content
          if (rebuild) {
            pop.setAttribute("data-rebuild", "true");
          }
        })

        // global form submit and client validation
        // TODO: change as pleased
        .on("click", ".action_submit", function (e) {
          var valid,
            form = document.getElementById(e.target.getAttribute("data-form")),
            target = e.target.href,
            id = form.id,
            pointer = "response:" + id,
            proceed = function (data, target) {
              // changePage with fragment_cache pointer
              $.mobile.changePage(target, {"transition": "slide", "data": data});
            };

          // stop
          e.preventDefault();

          // validate
          // TODO testForClass not working
          if ($(form).hasClass("validate")) {
            valid = $( form ).triggerHandler( "submitForm" );
          } else {
            valid = $( form ).serialize();
          }

          // fetch and proceed
          if (valid !== false) {
            $.ajax({
              "type":"POST",
              "url": "foo.php",
              "data": valid
            }).done(function(data) {
              // overwrite cache
              // NOTE: FAKE data until working
              priv.fragment_cache[id] = priv.getFakeRecords["payment"];
              proceed(pointer, target);
            }).fail(function(jqXHR) {
              // fake it
              priv.fragment_cache[id] = priv.getFakeRecords["payment"];
              proceed(pointer, target);
            });
          }
        });
    }
  });

  // page content handler
  $(document).on("pagebeforeshow", "div.ui-page", function (e, data) {
    var title,
      header,
      config = priv.page_setup[e.target.id];

    // set title
    if (config) {
      // global header
      header = document.getElementById("global_header");
      if (header) {
        title = header.getElementsByTagName("h1")[0];
        title.innerHTML = config.title;
        title.setAttribute("data-i18n", config.title_i18n);
      }
    }

    // gadget loading
    // TODO: not nice to pass data on URL-pointers
    $(".erp5_gadget").each(function (index, element) {
      var data,
        method = "construct" + priv.capitaliseFirstLetter(
        element.getAttribute("data-gadget")
        ),
        path = location.href.split("?");

      if (path[1]) {
        data = priv.fragment_cache[path[1].split(":")[1]];
      }

      priv[method](element, data);
    });

    // form validation initializer
    $("form")
       .filter(function () { return this.getAttribute("data-bound") !== true; })
       .each(function (i, element) {
         element.setAttribute("data-bound", true);
         // TODO: how to add custom validations here?
         $(element).validVal({
            validate: {
              onKeyup: "valid",
              onBlur: "valid"
            },
            form: {
              onInvalid: function() { return;}
            }
          });
      });
  });







  /* ====================================================================== */
  /*                             TRASH BUT STILL HERE                       */
  /* ====================================================================== */
  // this invokes all gadgets on a page
  // TODO: should be done differently, the data-gadget property is only used
  // here to pick the correct function. Later on, the function should be
  // called form inside the gadget
  $(document).on("pagebeforeshow", "#computer", function (e, data) {
    // NOTE: it should not be necessary to fetch this data from the URL
    // because JQM should pass it in data, too
    var mode,
      item,
      properties = {},
      parameters = decodeURIComponent(
        $.mobile.path.parseUrl(window.location.href).search.split("?")[1]
      ).split("&");

      mode = parameters[0].split("=")[1];
      if (parameters.length > 1) {
        item = parameters[1].split("=")[1];
      }

    $(".erp5_single").each(function (index, element) {
      // load data
      if (mode === "get" || mode === "clone") {
        priv.erp5.get({"_id": item}, function (error, response) {
          if (response) {
            // set to properties, so response
            properties = {};
            priv.constructTabs(element, mode, item, properties);
          } else {
            abort = confirm("Error trying to retrieve data! Go back to overview?");
            if (abort === true) {
              $.mobile.changePage("computers.html", {"rel":"back"});
            }
          }
        });
      } else {
        priv.constructTabs(element, mode, item, properties);
      }
    });

    // we can set later
    // priv.generateItem(mode, item);
  })
  /* ====================================================================== */
  /*                             BINDINGS                                   */
  /* ====================================================================== */
  // NOTE: should also not be done here, but in the respective gadget
  // NOTE: still if a form contains 10 relationfields, we should not generate
  // 10 popups and handlers, but only use a single popup shared across all
  // load item from table
  .on("click", "table tbody td a, .navbar li a.new_item", function (e) {
    var i,
      item,
      spec = {},
      url = e.target.getAttribute("href").split("?"),
      target = url[0],
      parameters = url[1].split("&");

    e.preventDefault();
    for (i = 0; i < parameters.length; i += 1) {
      item = parameters[i].split("=");
      spec[item[0]] = item[1];
    }

    $.mobile.changePage(target, {
      "transition": "fade",
      "data": spec
    });
  })
  .on("click", "a.remove_item", function (e) {
    var i,
      params = priv.splitSearchParams(),
      callback = function () {
        $.mobile.changePage("computers.html", {
          "transition":"fade",
          "reverse": "true"
        });
      };

    // item in URL?
    for (i = 0; i < params.length; i += 1) {
      parameter = params[i].split("=");
      if (parameter[0] === "item") {
        priv.modifyObject({"_id": decodeURIComponent(parameter[1])}, "remove", callback );
      }
    }
  })
  // save form
  .on("click", "a.save_object", function (e) {
    var i,
      parameter,
      method,
      object,
      // check the URL for the state we are in
      // NOTE: not nice, change later
      params = priv.splitSearchParams(),
      callback = function () {
        $.mobile.changePage("computers.html", {
          "transition":"fade",
          "reverse":"true"
        });
      };

    for (i = 0; i < params.length; i += 1) {
      parameter = params[i].split("=");
      if (parameter[0] === "mode") {
        switch (parameter[1]) {
          case "edit":
            method = "put";
            break;
          case "clone":
          case "add":
            method = "post";
            break;
        }
        if (method !== undefined) {
          object = priv.validateObject(
            priv.serializeObject($(".display_object"))
          );
          // fallback to eliminate _id on clone
          // TODO: do somewhere else!
          if (method === "post") {
            delete object._id;
          }
          priv.modifyObject(object, method, callback);
        } else {
          alert("missing command!, cannot store");
        }
      }
    }
  })
  // update navbar depending on item selected
  .on("change", "table tbody th input[type=checkbox]", function(e) {
    var allChecks = $(e.target).closest("tbody").find("th input[type=checkbox]:checked"),
      selected = allChecks.length,
      trigger = $(".navbar .new_item");

    if (selected === 1) {
      trigger.addClass("ui-btn-active clone_item").attr("href","computer.html?mode=clone&item=" + e.target.id);
    } else {
      trigger.removeClass("ui-btn-active clone_item").attr("href","computer.html?mode=add");
    }

  });
  
}(window, document, jQuery));
