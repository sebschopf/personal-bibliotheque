<div id="map" style="height: 400px; width: 100%;"></div>
<div id="route-info"></div>
<div id="debug"></div>

<link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>

<script>
  (function() {
    let map = null;
    let markers = [];
    let bounds = null;
    const geocodeCache = new Map();
    
    function debug(message) {
      console.log(message);
      const debugEl = document.getElementById('debug');
      if (debugEl) {
        debugEl.innerHTML += `${message}<br>`;
      }
    }

    // Fonction de géocodage avec Nominatim
    async function geocodeAddress(address) {
      // Vérifier le cache
      if (geocodeCache.has(address)) {
        return geocodeCache.get(address);
      }

      try {
        // Ajouter un délai pour respecter les limites de l'API
        await new Promise(resolve => setTimeout(resolve, 1000));

        const query = encodeURIComponent(address);
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
        const data = await response.json();

        if (data && data.length > 0) {
          const result = {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon)
          };
          
          // Mettre en cache le résultat
          geocodeCache.set(address, result);
          return result;
        }
        
        throw new Error('Address not found');
      } catch (err) {
        debug(`Geocoding error for ${address}: ${err.message}`);
        return null;
      }
    }

    function cleanup() {
      if (map) {
        map.remove();
        map = null;
      }
      markers = [];
      bounds = null;
      debug('Resources cleaned up');
    }

    function initMap() {
      if (map) return map;

      try {
        const mapEl = document.getElementById('map');
        if (!mapEl) throw new Error('Map container not found');

        map = L.map('map');
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        bounds = L.latLngBounds();
        debug('Map initialized');
        return map;
      } catch (err) {
        debug('Map initialization error: ' + err.message);
        return null;
      }
    }

    async function handleRecords(records) {
      debug('Processing records: ' + (records ? records.length : 0));

      try {
        const mapInstance = initMap();
        if (!mapInstance) return;

        // Nettoyer les marqueurs existants
        markers.forEach(m => m.remove());
        markers = [];
        bounds = L.latLngBounds();

        if (!records || records.length === 0) {
          document.getElementById('route-info').innerHTML = `
            <div style="padding: 1em; background-color: #f0f0f0; border-radius: 4px;">
              Aucun commerce assigné pour ce distributeur
            </div>
          `;
          mapInstance.setView([46.1812, 6.1375], 14);
          return;
        }

        // Afficher un message de chargement
        document.getElementById('route-info').innerHTML = `
          <div style="padding: 1em; background-color: #f0f0f0; border-radius: 4px;">
            Chargement des adresses en cours...
          </div>
        `;

        // Traiter chaque commerce assigné
        for (let i = 0; i < records.length; i++) {
          const record = records[i];
          const name = record.NOM || 'Sans nom';
          const address = [
            record.Rue,
            record.Numero,
            record.Code_Postal,
            record.Commune
          ].filter(Boolean).join(' ');

          // Géocoder l'adresse
          const coords = await geocodeAddress(address);
          if (coords) {
            bounds.extend([coords.lat, coords.lng]);

            // Créer un marqueur personnalisé avec un numéro
            const icon = L.divIcon({
              className: 'custom-div-icon',
              html: `<div style="background-color: #FF69B4; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold;">${i + 1}</div>`,
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            });

            const marker = L.marker([coords.lat, coords.lng], {icon})
              .bindPopup(`
                <b>${i + 1}. ${name}</b><br>
                ${address}
              `)
              .addTo(mapInstance);
            
            markers.push(marker);
          }
        }

        // Ajuster la vue pour montrer tous les marqueurs
        if (markers.length > 0) {
          mapInstance.fitBounds(bounds, {
            padding: [50, 50]
          });
        }

        // Mettre à jour la liste
        document.getElementById('route-info').innerHTML = `
          <h3>Points de distribution (${markers.length}/${records.length})</h3>
          <ol>
            ${records.map(r => `
              <li>
                <strong>${r.NOM || 'Sans nom'}</strong><br>
                ${[r.Rue, r.Numero, r.Code_Postal, r.Commune].filter(Boolean).join(' ')}
              </li>
            `).join('')}
          </ol>
        `;

        debug('Display updated successfully');
      } catch (err) {
        debug('Error handling records: ' + err.message);
      }
    }

    function initGrist() {
      if (!window.grist) {
        debug('Grist API not available');
        return;
      }

      try {
        cleanup();

        window.grist.ready({
          requiredAccess: 'read table',
          columns: ['NOM', 'Rue', 'Numero', 'Code_Postal', 'Commune', 'Distributeur']
        });

        window.grist.onRecords(handleRecords);
        
        debug('Grist initialized successfully');
      } catch (err) {
        debug('Grist initialization error: ' + err.message);
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initGrist);
    } else {
      initGrist();
    }

    window.addEventListener('unload', cleanup);
  })();
</script>