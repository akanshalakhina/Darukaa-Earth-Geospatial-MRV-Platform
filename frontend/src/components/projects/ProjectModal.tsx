import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Project, ProjectCreateInput } from '../../types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectCreateInput) => Promise<void>;
  initialData?: Project | null;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState<ProjectCreateInput>({
    name: '',
    description: '',
    project_type: 'Mangrove Restoration',
    standard: 'Verra VCS',
    status: 'Active',
    country: '',
    region: '',
    biome: 'Tropical Moist Forest',
    estimated_annual_tco2e: 25000,
    target_biodiversity_score: 88,
    budget: 1200000,
    developer_name: 'Darukaa Conservation Labs',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description || '',
        project_type: initialData.project_type,
        standard: initialData.standard,
        status: initialData.status,
        country: initialData.country,
        region: initialData.region || '',
        biome: initialData.biome,
        estimated_annual_tco2e: initialData.estimated_annual_tco2e,
        target_biodiversity_score: initialData.target_biodiversity_score,
        budget: initialData.budget,
        developer_name: initialData.developer_name,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        project_type: 'Mangrove Restoration',
        standard: 'Verra VCS',
        status: 'Active',
        country: '',
        region: '',
        biome: 'Tropical Moist Forest',
        estimated_annual_tco2e: 25000,
        target_biodiversity_score: 88,
        budget: 1200000,
        developer_name: 'Darukaa Conservation Labs',
      });
    }
    setError(null);
  }, [initialData, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ['estimated_annual_tco2e', 'target_biodiversity_score', 'budget'].includes(name)
        ? parseFloat(value) || 0
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.country.trim()) {
      setError('Project name and country are required.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Conservation Project' : 'Register New Environmental Project'}
      subtitle="Define project bounds, standards, biomes, and expected carbon/biodiversity targets."
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#f87171',
              fontSize: '0.8125rem',
              marginBottom: '1rem',
            }}
          >
            {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Project Title *</label>
          <input
            type="text"
            name="name"
            className="form-input"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Sundarbans Blue Carbon Initiative"
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Country *</label>
            <input
              type="text"
              name="country"
              className="form-input"
              value={formData.country}
              onChange={handleChange}
              placeholder="e.g. Peru, India, Scotland"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Region / Sub-basin</label>
            <input
              type="text"
              name="region"
              className="form-input"
              value={formData.region}
              onChange={handleChange}
              placeholder="e.g. Alto Mayo Biosphere"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Project Type</label>
            <select
              name="project_type"
              className="form-select"
              value={formData.project_type}
              onChange={handleChange}
            >
              <option value="Mangrove Restoration">Mangrove Restoration</option>
              <option value="Avoided Deforestation (REDD+)">Avoided Deforestation (REDD+)</option>
              <option value="Afforestation / Reforestation">Afforestation / Reforestation</option>
              <option value="Peatland Rewetting">Peatland Rewetting</option>
              <option value="Grassland & Savanna Soil Carbon">
                Grassland & Savanna Soil Carbon
              </option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Certification Standard</label>
            <select
              name="standard"
              className="form-select"
              value={formData.standard}
              onChange={handleChange}
            >
              <option value="Verra VCS">Verra VCS</option>
              <option value="Gold Standard">Gold Standard</option>
              <option value="Plan Vivo">Plan Vivo</option>
              <option value="Puro.earth">Puro.earth</option>
              <option value="American Carbon Registry">American Carbon Registry</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Primary Biome</label>
            <select
              name="biome"
              className="form-select"
              value={formData.biome}
              onChange={handleChange}
            >
              <option value="Tropical Moist Forest">Tropical Moist Forest</option>
              <option value="Mangrove / Coastal Wetland">Mangrove / Coastal Wetland</option>
              <option value="Tropical Peat Swamp">Tropical Peat Swamp</option>
              <option value="Temperate Peatland">Temperate Peatland</option>
              <option value="Savanna Woodland">Savanna Woodland</option>
              <option value="Montane Cloud Forest">Montane Cloud Forest</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Lifecycle Status</label>
            <select
              name="status"
              className="form-select"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Draft">Draft</option>
              <option value="Under Validation">Under Validation</option>
              <option value="Active">Active</option>
              <option value="Verified">Verified</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label">Est. Annual tCO2e</label>
            <input
              type="number"
              name="estimated_annual_tco2e"
              className="form-input"
              value={formData.estimated_annual_tco2e}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Bio Score (0-100)</label>
            <input
              type="number"
              name="target_biodiversity_score"
              className="form-input"
              value={formData.target_biodiversity_score}
              onChange={handleChange}
              min="0"
              max="100"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Budget ($ USD)</label>
            <input
              type="number"
              name="budget"
              className="form-input"
              value={formData.budget}
              onChange={handleChange}
              min="0"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Description & Conservation Methodology</label>
          <textarea
            name="description"
            className="form-textarea"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe restoration goals, community benefits, and MRV schedule..."
          />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            marginTop: '1.5rem',
          }}
        >
          <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving Project...' : initialData ? 'Update Project' : 'Register Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
