// Initialisation de Grist
grist.ready({ requiredAccess: 'read table' });

// Configuration
const config = {
    distributeurTable: 'Distributeurs_2025',
    commercantsTable: 'T2024_commercants'
};

class DistributeurApp {
    constructor() {
        this.distributeur = null;
        this.commerces = [];
        this.initializeApp();
    }

    initializeApp() {
        grist.onRecord(this.handleRecordChange.bind(this));
        document.getElementById('print-button').addEventListener('click', () => window.print());
        this.updateDateTime();
    }

    async handleRecordChange(record) {
        this.distributeur = record;
        await this.fetchCommerces();
        this.updateUI();
    }

    async fetchCommerces() {
        if (!this.distributeur || !this.distributeur.id) {
            this.commerces = [];
            return;
        }

        try {
            const rawData = await grist.docApi.fetchTable(config.commercantsTable);
            const allCommerces = this.convertGristRecords(rawData);
            this.commerces = allCommerces.filter(commerce => 
                commerce.Distributeur && 
                Array.isArray(commerce.Distributeur) && 
                commerce.Distributeur.includes(this.distributeur.id)
            );
        } catch (error) {
            console.error('Erreur lors de la récupération des commerces:', error);
            this.commerces = [];
        }
    }

    convertGristRecords(gristData) {
        if (!gristData || !gristData.id || !Array.isArray(gristData.id)) return [];
        
        return gristData.id.map((_, index) => {
            const record = {};
            for (const [key, values] of Object.entries(gristData)) {
                if (Array.isArray(values) && values.length > index) {
                    record[key] = values[index];
                }
            }
            return record;
        }).filter(record => record.id !== undefined);
    }

    updateUI() {
        this.updateDateTime();
        this.updateDistributeurInfo();
        this.updateCommerces();
    }

    updateDateTime() {
        const dateElement = document.getElementById('current-date');
        const now = new Date();
        dateElement.textContent = `Date d'impression: ${now.toLocaleString('fr-CH', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        })}`;
    }

    updateDistributeurInfo() {
        const infoElement = document.getElementById('distributeur-info');
        if (!this.distributeur) {
            infoElement.textContent = 'Aucun distributeur sélectionné';
            return;
        }

        infoElement.innerHTML = `
            <p><strong>${this.distributeur.Forme_politesse || ''} ${this.distributeur.NOM || ''} ${this.distributeur.Prenom || ''}</strong></p>
            <p>${this.distributeur.Rue || ''} ${this.distributeur.Numero || ''}, ${this.distributeur.Code_Postal || ''} ${this.distributeur.Localite || ''}</p>
            <p>Tél: ${this.distributeur.Tel_fixe || this.distributeur.Tel_portable || 'Non renseigné'} | Email: ${this.distributeur.Adresse_electronique || 'Non renseigné'}</p>
        `;
    }

    updateCommerces() {
        const summaryElement = document.getElementById('commerces-summary');
        const tableBody = document.querySelector('#commerces-table tbody');

        if (this.commerces.length === 0) {
            summaryElement.textContent = 'Aucun commerce assigné';
            tableBody.innerHTML = '';
            return;
        }

        const totalTirelires = this.commerces.reduce((sum, commerce) => sum + (Number(commerce.Tirelires) || 0), 0);

        summaryElement.innerHTML = `
            Nombre de commerces: ${this.commerces.length} | Total des tirelires : ${totalTirelires}
        `;

        tableBody.innerHTML = this.commerces.map(commerce => `
            <tr class="commerce-row">
                <td>${commerce.NOM || ''}</td>
                <td>${commerce.Rue || ''} ${commerce.Numero || ''}, ${commerce.Code_Postal || ''} ${commerce.Commune || ''}</td>
                <td>${commerce.Tirelires || '0'}</td>
                <td><div class="check-box"></div></td>
            </tr>
        `).join('');
    }
}

// Initialisation de l'application
new DistributeurApp();