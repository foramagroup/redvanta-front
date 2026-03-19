import AffiliateTracker from "../../../components/AffiliateTracker";

export default function AffiliatePage({ params }) {
  const { code } = params;
  return (
    <div>
      <AffiliateTracker code={code} />
      <h2 className="text-2xl font-semibold">Merci — Code : {code}</h2>
      <p>Vous avez été redirigé avec le code affilié `{code}`. Votre cookie a été enregistré.</p>
    </div>
  );
}
