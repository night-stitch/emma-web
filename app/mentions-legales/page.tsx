import type { Metadata } from 'next';
import LegalPage from '../components/LegalPage';
import { CONTACT, SITE_NAME, SITE_URL } from '../lib/site';

export const metadata: Metadata = {
    title: 'Mentions légales',
    description: `Mentions légales du site ${SITE_NAME}.`,
    alternates: { canonical: '/mentions-legales' },
};

// ⚠️ Les éléments surlignés « À COMPLÉTER » doivent être remplis avec les informations officielles de l'entreprise.
const T = ({ children }: { children: React.ReactNode }) => <span className="todo">{children}</span>;

export default function MentionsLegales() {
    return (
        <LegalPage surtitle="Informations" title="Mentions légales" updated="octobre 2026">
            <div>
                <h2>Éditeur du site</h2>
                <p>Le site <strong>{SITE_URL.replace('https://', '')}</strong> est édité par :</p>
                <ul>
                    <li><strong>{SITE_NAME}</strong> — <T>forme juridique À COMPLÉTER (ex. micro-entreprise, SAS…)</T></li>
                    <li>Responsable : <T>Prénom NOM À COMPLÉTER</T></li>
                    <li>Adresse : <T>adresse du siège À COMPLÉTER</T></li>
                    <li>SIRET : <T>À COMPLÉTER</T> — RCS / RNE : <T>À COMPLÉTER</T></li>
                    <li>N° TVA intracommunautaire : <T>À COMPLÉTER ou « TVA non applicable, art. 293 B du CGI »</T></li>
                    <li>Téléphone : <a href={CONTACT.phoneHref}>{CONTACT.phone}</a></li>
                    <li>Email : <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
                </ul>
                <p>Directeur·rice de la publication : <T>Prénom NOM À COMPLÉTER</T>.</p>
            </div>

            <div>
                <h2>Hébergement</h2>
                <p>
                    Le site est hébergé par <strong>Google Firebase Hosting</strong> — Google LLC,
                    1600 Amphitheatre Parkway, Mountain View, CA 94043, États-Unis.
                    Pour l&apos;Europe : Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irlande.
                </p>
            </div>

            <div>
                <h2>Propriété intellectuelle</h2>
                <p>
                    L&apos;ensemble des contenus de ce site (textes, photographies, logo, mise en page) est la propriété
                    de {SITE_NAME} ou de leurs auteurs respectifs. Toute reproduction, représentation ou diffusion,
                    totale ou partielle, sans autorisation écrite préalable est interdite.
                </p>
            </div>

            <div>
                <h2>Responsabilité</h2>
                <p>
                    {SITE_NAME} s&apos;efforce de fournir des informations exactes et à jour. Les tarifs et
                    prestations présentés sont indicatifs et ne constituent pas une offre contractuelle :
                    seul un devis signé engage les deux parties.
                </p>
            </div>

            <div>
                <h2>Données personnelles</h2>
                <p>
                    Le traitement de vos données est détaillé dans notre <a href="/confidentialite">politique de confidentialité</a>.
                </p>
            </div>

            <div>
                <h2>Crédits</h2>
                <p>Conception et développement du site : <T>À COMPLÉTER</T>.</p>
            </div>
        </LegalPage>
    );
}
