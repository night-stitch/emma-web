import type { Metadata } from 'next';
import LegalPage from '../components/LegalPage';
import { CONTACT, SITE_NAME } from '../lib/site';

export const metadata: Metadata = {
    title: 'Politique de confidentialité',
    description: `Comment ${SITE_NAME} collecte et protège vos données personnelles (RGPD).`,
    alternates: { canonical: '/confidentialite' },
};

const T = ({ children }: { children: React.ReactNode }) => <span className="todo">{children}</span>;

export default function Confidentialite() {
    return (
        <LegalPage surtitle="RGPD" title="Confidentialité" updated="octobre 2026">
            <div>
                <h2>Responsable du traitement</h2>
                <p>
                    <strong>{SITE_NAME}</strong>, <T>adresse À COMPLÉTER</T>, est responsable du traitement des
                    données collectées sur ce site. Contact : <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>.
                </p>
            </div>

            <div>
                <h2>Données collectées</h2>
                <p>Nous collectons uniquement les données que vous nous transmettez via le formulaire de contact :</p>
                <ul>
                    <li>nom, adresse email, numéro de téléphone (facultatif) ;</li>
                    <li>sujet et contenu de votre message.</li>
                </ul>
                <p>Aucune donnée n&apos;est collectée à votre insu et aucun cookie publicitaire ou de mesure d&apos;audience n&apos;est utilisé.</p>
            </div>

            <div>
                <h2>Finalité et base légale</h2>
                <p>
                    Ces données servent exclusivement à répondre à votre demande et, le cas échéant, à établir un devis.
                    Le traitement repose sur votre <strong>consentement</strong>, donné en cochant la case du formulaire,
                    et sur les mesures précontractuelles prises à votre demande.
                </p>
            </div>

            <div>
                <h2>Durée de conservation</h2>
                <p>
                    Vos données sont conservées <strong>3 ans</strong> à compter de notre dernier échange, puis supprimées.
                    Les données liées à un contrat ou une facture sont conservées pendant la durée légale (10 ans pour les pièces comptables).
                </p>
            </div>

            <div>
                <h2>Destinataires et hébergement</h2>
                <p>
                    Vos données sont destinées uniquement à {SITE_NAME} et ne sont jamais vendues ni cédées.
                    Elles sont stockées de façon sécurisée sur les serveurs de Google Firebase (Google Ireland Limited),
                    <T> localisation des serveurs À VÉRIFIER dans la console Firebase</T>. Google agit en tant que sous-traitant
                    et applique les clauses contractuelles types de la Commission européenne.
                </p>
            </div>

            <div>
                <h2>Vos droits</h2>
                <p>Conformément au RGPD et à la loi Informatique et Libertés, vous disposez des droits suivants :</p>
                <ul>
                    <li>accès, rectification et effacement de vos données ;</li>
                    <li>limitation et opposition au traitement ;</li>
                    <li>portabilité de vos données ;</li>
                    <li>retrait de votre consentement à tout moment.</li>
                </ul>
                <p>
                    Pour les exercer, écrivez-nous à <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>.
                    Nous vous répondrons sous un mois. Vous pouvez également introduire une réclamation auprès de la
                    CNIL (<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>).
                </p>
            </div>

            <div>
                <h2>Cookies</h2>
                <p>
                    Ce site n&apos;utilise pas de cookies de suivi. Seul un stockage technique est utilisé pour
                    maintenir la connexion de l&apos;espace d&apos;administration ; il ne concerne pas les visiteurs.
                </p>
            </div>
        </LegalPage>
    );
}
