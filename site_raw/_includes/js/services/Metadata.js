angular.module('wcodpApp').factory('metadata', [function() {

    /**
     * fieldConfigs - object with config for each metadata field we want to display
     * Each config contains a JQuery selector(s) and a formatter for each metadata format
     * that defines what values to extract from the metadata and how to present it ot the user
     * Note that for crossbrowser support of namespaced elements, we provide two selector paths: one with 
     * the namespaces (e.g. gmd) and escaped colons; another without the namespaces.
     */ 
    var _fieldConfigs = {
        datePublished: {
            cd: {
                selectors: null,
                formatter: "first"
            },
            fgdc: {
                selectors: "metadata > idinfo > citation > citeinfo > pubdate",
                formatter: "first"
            },
            iso: {
                selectors: "gmd\\:identificationInfo > gmd\\:MD_DataIdentification > gmd\\:citation > gmd\\:CI_Citation > gmd\\:date > gmd\\:CI_Date > gmd\\:date > gco\\:DateTime, identificationInfo > MD_DataIdentification > citation > CI_Citation > date > CI_Date > date > DateTime",
                formatter: "first"
            },            
            isoii: {
                //Matching on 'gmd\\:' namespace within pseudoselectors 'has' and 'contains' was not returning a result, dropping this match in these places but leaving elsewhere worked for some reason.
                selectors: "gmd\\:identificationInfo > gmd\\:MD_DataIdentification > gmd\\:citation > gmd\\:CI_Citation > gmd\\:date > gmd\\:CI_Date:has(dateType:has(CI_DateTypeCode:contains('publication'))) > gmd\\:date > gco\\:Date, identificationInfo > MD_DataIdentification > citation > CI_Citation > date > CI_Date:has(dateType:has(CI_DateTypeCode:contains('publication'))) > gdate > Date",
                formatter: "first"
            },            
            isoii2: {
                //Original iso2 selector left as secondary
                selectors: "gmd\\:identificationInfo > gmd\\:MD_DataIdentification > gmd\\:citation > gmd\\:CI_Citation > gmd\\:date > gmd\\:CI_Date > gmd\\:date > gco\\:Date, identificationInfo > MD_DataIdentification > citation > CI_Citation > date > CI_Date > gdate > Date",
                formatter: "first"
            }
        },
        creator: {
            cd: {
                selectors: "rdf\\:RDF > rdf\\:Description > dc\\:creator",
                formatter: "first"
            },
            fgdc: {
                selectors: "metadata > idinfo > citation > citeinfo > origin",
                formatter: "list"
            },
            iso: {
                selectors: "gmd\\:identificationInfo > gmd\\:MD_DataIdentification > gmd\\:pointOfContact > gmd\\:CI_ResponsibleParty > gmd\\:organisationName > gco\\:CharacterString, identificationInfo > MD_DataIdentification > pointOfContact > CI_ResponsibleParty > organisationName > CharacterString",
                formatter: "first"
            },
            isoii: {
                selectors: "gmd\\:identificationInfo > gmd\\:MD_DataIdentification > gmd\\:citation > gmd\\:CI_Citation > gmd\\:citedResponsibleParty > gmd\\:CI_ResponsibleParty > gmd\\:organisationName > gco\\:CharacterString, identificationInfo > MD_DataIdentification > gcitation > CI_Citation > citedResponsibleParty > CI_ResponsibleParty > organisationName > CharacterString",
                formatter: "first"
            }
        },
        publisher: {
            cd: {
                selectors: null,
                formatter: "first"
            },
            fgdc: {
                selectors: "metadata > distinfo > distrib > cntinfo > cntorgp > cntorg",
                formatter: "first"
            },
            iso: {
                selectors: "gmd\\:contact > gmd\\:CI_ResponsibleParty > gmd\\:organisationName > gco\\:CharacterString, contact > CI_ResponsibleParty > organisationName > CharacterString",
                formatter: "first"
            },
            isoii: {
                selectors: "gmd\\:contact > gmd\\:CI_ResponsibleParty > gmd\\:organisationName > gco\\:CharacterString, contact > CI_ResponsibleParty > organisationName > CharacterString",
                formatter: "first"
            }
        },
        contactName: {
            cd: {
                selectors: null,
                formatter: "first"
            },
            fgdc: {
                selectors: "metadata > idinfo > ptcontac > cntinfo > cntorgp > cntper",
                formatter: "first"
            },
            iso: {
                selectors: "gmd\\:MD_Metadata > gmd\\:identificationInfo > gmd\\:MD_DataIdentification > gmd\\:pointOfContact > gmd\\:CI_ResponsibleParty > gmd\\:individualName > gco\\:CharacterString, MI_Metadata > identificationInfo > MD_DataIdentification > pointOfContact > CI_ResponsibleParty > individualName > CharacterString",
                formatter: "first"
            },
            isoii: {
                selectors: "gmd\\:identificationInfo > gmd\\:MD_DataIdentification > gmd\\:citation > gmd\\:CI_Citation > gmd\\:citedResponsibleParty > gmd\\:CI_ResponsibleParty > gmd\\:individualName, identificationInfo > MD_DataIdentification > citation > CI_Citation > citedResponsibleParty > CI_ResponsibleParty > individualName",
                formatter: "first"
            }
		},
        contactEmail: {
            cd: {
                selectors: null,
                formatter: "first"
            },
            fgdc: {
                selectors: "metadata > idinfo > ptcontac > cntinfo > cntemail",
                formatter: "first"
            },
            //this isoii selector purposefully put before the iso selector to prevent false positive matches on the iso selector
            isoii: {
                selectors: "gmd\\:identificationInfo > gmd\\:MD_DataIdentification > gmd\\:citation > gmd\\:CI_Citation > gmd\\:citedResponsibleParty > gmd\\:CI_ResponsibleParty > gmd\\:contactInfo > gmd\\:CI_Contact > gmd\\:address > gmd\\:CI_Address > gmd\\:electronicMailAddress > gco\\:CharacterString, identificationInfo > MD_DataIdentification > citation > CI_Citation > citedResponsibleParty > CI_ResponsibleParty > gmd\\:contactInfo > CI_Contact > address > CI_Address > electronicMailAddress > CharacterString",
                formatter: "first"
            },            
            iso: {
                selectors: "gmd\\:contactInfo > gmd\\:CI_Contact > gmd\\:address > gmd\\:CI_Address > gmd\\:electronicMailAddress > gco\\:CharacterString, contactInfo > CI_Contact > address > CI_Address > electronicMailAddress > CharacterString",
                formatter: "first"
            }                
        },
        constraints: {
            cd: {
                selectors: "rdf\\:RDF > rdf\\:Description > dct\\:abstract > rdf\\:value[rdf\\:resource='mxd.subject']",
                formatter: "first"
            },
            fgdc: {
                selectors: "metadata > idinfo > useconst",
                formatter: "first"
            },
            iso: {
                selectors: "gmd\\:identificationInfo > gmd\\:MD_DataIdentification > gmd\\:resourceConstraints > gmd\\:MD_LegalConstraints > gmd\\:otherConstraints > gco\\:CharacterString, identificationInfo > MD_DataIdentification > resourceConstraints > MD_LegalConstraints > otherConstraints > CharacterString",
                formatter: "first"
            },
            isoii: {
                selectors: "gmd\\:identificationInfo > gmd\\:MD_DataIdentification > gmd\\:resourceConstraints > gmd\\:MD_LegalConstraints > gmd\\:useLimitation > gco\\:CharacterString, identificationInfo > MD_DataIdentification > resourceConstraints > MD_LegalConstraints > useLimitation > CharacterString",
                formatter: "first"
            }
        }
    };

    function _getFieldConfigs(fieldName) {
        if (_.has(_fieldConfigs, fieldName)) {
            return _fieldConfigs[fieldName];
        }
        return null;
    }

    /**
     * Returns formatted value of first matching selector
     * 
     * @param fieldConfig - object with selectors, one for each metadata standard.
     * @param xml - parsed xml metadata document
     */ 
    function _getVal(fieldConfig, xml) {
        var formatter = null;
        //Set formatter
        switch(fieldConfig.formatter) {
            case 'first':
                formatter = _getFirstVal
                break;
            case 'list':
                formatter = _getListVal
                break;
            default:
                formatter = _getFirstVal
        }
        var matchElements = $(xml).find(fieldConfig.selectors)        
        return formatter(matchElements);
    }

    //Return the text value of the first match
    function _getFirstVal(elements) {        
        var val = null;
        elements.each(function () {
            val = $(this).text();
            if (val) {
                val = $.trim(val);
            }
            return; 
        });
        return val;
    }
    
    //Return a combined list of all matches, separated by semicolon
    function _getListVal(elements) {        
        var val = elements.map(function() {
            return $(this).text();
        }).toArray().join("; ");
        if (val) {
            return val;
        } else {
            return null;
        }
    }

    return {
        
        /**
         * Finds and returns a value for the given metadata key. The key 
         * is used to get an xml path across multiple xml metadata formats 
         * (ISO, ISO2, DC, FGDC).
         * 
         * @param  {[type]} fieldName Key used to lookup value accross
         * multiple metadata formats.
         * @param  {[type]} xml       Metadata as XML provided by jQuery.
         * @return {string | null}    Null if a value is not found. Otherwise,
         * the value as a string.
         */
        get: function (fieldName, xml) {
            var fieldConfigs = _getFieldConfigs(fieldName);
            //Global
            val = null;
            //For each field to display, get value from xml doc
            _.some(fieldConfigs, function(fieldConfig, key) {
                if (fieldConfig.selectors) {
                    val = _getVal(fieldConfig, xml);
                    return val;
                } else {
                    return null;
                }
            });
            return val;
        },

        getXml: function (url, success, fail) {
            $.ajax({
                type: "GET",
                url: url,
                dataType: "xml",
                success: function (xml, status, jqXhr) {
                    if (success) {
                        success(xml);
                    }
                },
                complete: function (jqXhr, status) {
                    if (console) { console.log('XML request: ' + status); }
                }

            });            
        }

    };

}]);
