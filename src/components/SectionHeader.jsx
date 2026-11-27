import React from 'react';

/**
 * Encabezado común de sección/panel: ícono, título, badge opcional,
 * descripción y acciones alineadas a la derecha.
 */
const SectionHeader = ({ icon: Icon, title, badge, description, actions, as: Tag = 'h2', size = 'lg' }) => {
  const titleSize = size === 'lg' ? 'text-lg' : 'text-base';

  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-gray-400 flex-shrink-0" aria-hidden="true" />}
          <Tag className={`${titleSize} font-semibold text-gray-100`}>{title}</Tag>
          {badge}
        </div>
        {description && (
          <p className="mt-1 text-sm text-gray-400">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
};

export default SectionHeader;
