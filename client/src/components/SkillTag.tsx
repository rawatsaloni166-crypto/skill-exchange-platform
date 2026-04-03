interface SkillTagProps {
  skill: string;
  variant?: 'offered' | 'wanted' | 'default';
}

export default function SkillTag({ skill, variant = 'default' }: SkillTagProps) {
  return <span className={`skill-tag skill-tag-${variant}`}>{skill}</span>;
}
