const CorporateATSTemplate = ({ data, accentColor }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [year, month] = dateStr.split("-");
    return new Date(year, month - 1).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-7 bg-white text-gray-800 leading-relaxed">
      <header className="mb-2 flex items-center gap-4">
        {data.personal_info?.image && (
          <img
            src={data.personal_info.image}
            alt="profile"
            className="w-20 h-20 rounded-full object-cover"
            style={{backgroundColor: accentColor}}
          />
        )}
        <div>
          <h1 className="text-3xl font-semibold">
            {data.personal_info?.full_name || "Your Name"}
          </h1>
          <p className="text-sm text-gray-600">
            {data.personal_info?.profession || ""}
          </p>
          <div className="flex flex-wrap gap-1 text-sm text-gray-600">
            {data.personal_info?.email && (
              <a target="_blank" href={`mailto:${data.personal_info?.email}`}>
                <span>• {data.personal_info.email}</span>
              </a>
            )}
            {data.personal_info?.phone && (
              <span>• {data.personal_info.phone}</span>
            )}
            {data.personal_info?.location && (
              <span>• {data.personal_info.location}</span>
            )}
            {data.personal_info?.linkedin && (
              <a
                target="_blank"
                href={
                  data.personal_info?.linkedin.startsWith("https://")
                    ? data.personal_info?.linkedin
                    : `https://${data.personal_info?.linkedin}`
                }
              >
                <span className="break-all">
                  •{" "}
                  {data.personal_info.linkedin.split("https://")[1]
                    ? data.personal_info.linkedin.split("https://")[1]
                    : data.personal_info.linkedin}
                </span>
              </a>
            )}
            {data.personal_info?.github && (
              <a
                target="_blank"
                href={
                  data.personal_info?.github.startsWith("https://")
                    ? data.personal_info?.github
                    : `https://${data.personal_info?.github}`
                }
              >
                <span className="break-all">
                  •{" "}
                  {data.personal_info.github.split("https://")[1]
                    ? data.personal_info.github.split("https://")[1]
                    : data.personal_info.github}
                </span>
              </a>
            )}
            {data.personal_info?.website && (
              <a
                target="_blank"
                href={
                  data.personal_info?.website.startsWith("https://")
                    ? data.personal_info?.website
                    : `https://${data.personal_info?.website}`
                }
              >
                <span className="break-all">
                  •{" "}
                  {data.personal_info.website.split("https://")[1]
                    ? data.personal_info.website.split("https://")[1]
                    : data.personal_info.website}
                </span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Profile Info */}
      {data.profile_info && (
        <section className="mb-2">
          <h2
            style={{ color: accentColor }}
            className="text-sm font-semibold uppercase"
          >
            Profile Information
          </h2>
          <p className="text-gray-700 whitespace-pre-line">
            {data.profile_info}
          </p>
        </section>
      )}

      <section className="mb-2">
        {data.professional_summary && (
          <>
            <h2
              style={{ color: accentColor }}
              className="text-sm font-semibold uppercase"
            >
              Professional Summary
            </h2>
            <p className="text-gray-700">{data.professional_summary}</p>
          </>
        )}
      </section>

      {data.experience && data.experience.length > 0 && (
        <section className="mb-2">
          <h2
            style={{ color: accentColor }}
            className="text-sm font-semibold uppercase"
          >
            Professional Experience
          </h2>
          <div>
            {data.experience.map((exp, i) => (
              <div key={i} className="mb-1">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{exp.position}</div>
                    <div className="text-sm text-gray-600">{exp.company}</div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(exp.start_date)} -{" "}
                    {exp.is_current ? "Present" : formatDate(exp.end_date)}
                  </div>
                </div>
                {exp.description && (
                  <div className="text-gray-700 whitespace-pre-line">
                    {exp.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {data.project && data.project.length > 0 && (
        <section className="mb-2">
          <h2
            style={{ color: accentColor }}
            className="text-sm font-semibold uppercase"
          >
            Projects
          </h2>
          <div>
            {data.project.map((p, i) => (
              <div key={i} className="mb-1">
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-gray-600">{p.description}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.education && data.education.length > 0 && (
        <section className="mb-2">
          <h2
            style={{ color: accentColor }}
            className="text-sm font-semibold uppercase"
          >
            Education
          </h2>
          <div>
            {data.education.map((edu, i) => (
              <div key={i} className="flex justify-between items-start mb-1">
                <div>
                  <div className="font-medium">
                    {edu.degree}
                    {edu.field ? ` in ${edu.field}` : ""}
                  </div>
                  <div className="text-sm text-gray-600">{edu.institution}</div>
                </div>
                <div className="text-sm text-gray-500">
                  {formatDate(edu.graduation_date)}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.skills && data.skills.length > 0 && (
        <section>
          <h2
            style={{ color: accentColor }}
            className="text-sm font-semibold uppercase"
          >
            Core Skills
          </h2>
          <div className="text-sm text-gray-700 flex flex-wrap gap-2">
            {data.skills.map((s, idx) => (
              <div key={idx} className="px-0.5 rounded text-sm">
                {s}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default CorporateATSTemplate;
