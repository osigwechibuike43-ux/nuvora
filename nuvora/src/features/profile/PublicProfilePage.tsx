import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Award } from "lucide-react";
import { PageSpinner, Card } from "@/components/ui/Primitives";
import { ErrorState, EmptyState } from "@/components/ui/States";
import { Logo } from "@/components/brand/Logo";
import { getPublicProfile, getPublicCertificates, type PublicCertificate } from "@/services/profile/publicProfileService";
import { usePageMeta } from "@/hooks/usePageMeta";
import type { Profile } from "@/types/database";
import { titleCase } from "@/lib/utils";

export function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [certificates, setCertificates] = useState<PublicCertificate[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);
  usePageMeta(profile?.full_name ? `${profile.full_name} on NUVORA` : "NUVORA profile");

  useEffect(() => {
    if (!username) return;
    getPublicProfile(username)
      .then(async (found) => {
        if (!found) {
          setNotFound(true);
          return;
        }
        setProfile(found);
        setCertificates(await getPublicCertificates(found.id));
      })
      .catch(() => setError(true));
  }, [username]);

  if (error) return <ErrorState message="We couldn't load this profile." />;
  if (notFound) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-5 text-center">
        <h1 className="font-display text-2xl font-semibold">Profile not found</h1>
        <p className="text-nuvora-muted">This profile doesn't exist, or hasn't been made public.</p>
        <Link to="/" className="text-nuvora-green hover:underline">
          Back to NUVORA
        </Link>
      </div>
    );
  }
  if (!profile) return <PageSpinner label="Loading profile" />;

  return (
    <div className="min-h-screen px-5 py-12">
      <div className="mx-auto max-w-2xl">
        <Link to="/">
          <Logo className="mb-10" />
        </Link>

        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-nuvora-green/10 text-2xl font-semibold text-nuvora-green">
            {(profile.full_name ?? "N").charAt(0).toUpperCase()}
          </span>
          <div>
            <h1 className="font-display text-2xl font-semibold">{profile.full_name ?? "NUVORA learner"}</h1>
            {profile.current_level && (
              <p className="text-sm text-nuvora-muted">{titleCase(profile.current_level)} learner</p>
            )}
          </div>
        </div>

        {profile.bio && <p className="mt-5 text-nuvora-muted">{profile.bio}</p>}

        <div className="mt-10">
          <h2 className="mb-3 text-sm font-medium text-nuvora-muted">Certificates</h2>
          {certificates.length === 0 ? (
            <EmptyState
              icon={<Award className="h-7 w-7 text-nuvora-green" />}
              title="No certificates yet"
              message="Completed courses will appear here."
            />
          ) : (
            <div className="flex flex-col gap-2.5">
              {certificates.map((cert) => (
                <Card key={cert.courseId} className="flex items-center gap-3 p-4">
                  <Award className="h-5 w-5 shrink-0 text-nuvora-green" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{cert.courseTitle}</p>
                    <p className="text-xs text-nuvora-muted">
                      Completed {new Date(cert.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
