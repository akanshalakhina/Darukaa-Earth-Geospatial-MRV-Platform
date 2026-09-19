import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as turf from '@turf/turf';
import { Layers, Maximize, PenTool, Trash2, CheckCircle2 } from 'lucide-react';
import { SiteFeatureCollection, SiteFeature } from '../../types';

interface MapboxMapProps {
  sitesGeoJSON: SiteFeatureCollection;
  selectedSiteId?: number | null;
  onSelectSite: (siteId: number) => void;
  onPolygonCreated?: (geometry: any, areaHectares: number, centroid: [number, number]) => void;
  isDrawingMode?: boolean;
  onToggleDrawingMode?: (active: boolean) => void;
  activeProjectId?: number | null;
}

export const MapboxMap: React.FC<MapboxMapProps> = ({
  sitesGeoJSON,
  selectedSiteId,
  onSelectSite,
  onPolygonCreated,
  isDrawingMode = false,
  onToggleDrawingMode,
  activeProjectId,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const onPolygonCreatedRef = useRef(onPolygonCreated);

  useEffect(() => {
    onPolygonCreatedRef.current = onPolygonCreated;
  }, [onPolygonCreated]);

  const [mapStyle, setMapStyle] = useState<string>('dark');
  const [drawnHectares, setDrawnHectares] = useState<number | null>(null);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Use token from environment or public fallback
    const token =
      import.meta.env.VITE_MAPBOX_TOKEN ||
      'pk.eyJ1IjoiZGFydWthYS1lYXJ0aCIsImEiOiJjbHR0ZW93b3gwMGNnMm1vNWZ6dTF6eGhzIn0.demo';
    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [20.0, 10.0], // Global initial view
      zoom: 2.2,
      projection: { name: 'mercator' },
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'bottom-right');
    map.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

    // Initialize Mapbox Draw
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
      defaultMode: 'simple_select',
    });

    map.addControl(draw as any, 'top-left');
    drawRef.current = draw;
    mapRef.current = map;

    map.on('load', () => {
      setMapLoaded(true);
    });

    // Handle Draw Events
    const handleDrawCreateOrUpdate = () => {
      const data = draw.getAll();
      if (data.features.length > 0) {
        const latestFeature = data.features[data.features.length - 1];
        if (latestFeature.geometry.type === 'Polygon') {
          const areaM2 = turf.area(latestFeature);
          const areaHa = Math.round((areaM2 / 10000.0) * 100) / 100;
          const centroidFeature = turf.centroid(latestFeature);
          const centroidCoords = centroidFeature.geometry.coordinates as [number, number];

          setDrawnHectares(areaHa);

          if (onPolygonCreatedRef.current) {
            onPolygonCreatedRef.current(latestFeature.geometry, areaHa, centroidCoords);
          }
        }
      }
    };

    map.on('draw.create', handleDrawCreateOrUpdate);
    map.on('draw.update', handleDrawCreateOrUpdate);

    return () => {
      map.remove();
    };
  }, []);

  // Update Map Style
  const handleStyleChange = (styleKey: string) => {
    setMapStyle(styleKey);
    if (!mapRef.current) return;

    const styleMap: Record<string, string> = {
      dark: 'mapbox://styles/mapbox/dark-v11',
      satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
      outdoors: 'mapbox://styles/mapbox/outdoors-v12',
      light: 'mapbox://styles/mapbox/light-v11',
    };

    mapRef.current.setStyle(styleMap[styleKey]);
  };

  // Toggle Draw Mode
  const startDrawingPolygon = useCallback(() => {
    if (!drawRef.current) return;
    drawRef.current.deleteAll();
    drawRef.current.changeMode('draw_polygon');
    setDrawnHectares(null);
    if (onToggleDrawingMode) onToggleDrawingMode(true);
  }, [onToggleDrawingMode]);

  const clearDrawing = useCallback(() => {
    if (!drawRef.current) return;
    drawRef.current.deleteAll();
    setDrawnHectares(null);
    if (onToggleDrawingMode) onToggleDrawingMode(false);
  }, [onToggleDrawingMode]);

  // Update or render Site Polygons on map
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const sourceId = 'sites-source';
    const fillLayerId = 'sites-fill';
    const lineLayerId = 'sites-line';
    const highlightLayerId = 'sites-highlight';

    // Check if source exists, update data or add
    if (map.getSource(sourceId)) {
      (map.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(sitesGeoJSON as any);
    } else {
      map.addSource(sourceId, {
        type: 'geojson',
        data: sitesGeoJSON as any,
      });

      // Fill layer
      map.addLayer({
        id: fillLayerId,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': [
            'match',
            ['get', 'threat_level'],
            'Critical',
            '#ef4444',
            'High',
            '#f97316',
            'Moderate',
            '#f59e0b',
            '#10b981', // Default Low / Safe
          ],
          'fill-opacity': 0.4,
        },
      });

      // Boundary Line Layer
      map.addLayer({
        id: lineLayerId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': '#10b981',
          'line-width': 2,
          'line-opacity': 0.9,
        },
      });

      // Selected Highlight Layer
      map.addLayer({
        id: highlightLayerId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': '#38bdf8',
          'line-width': 4,
          'line-opacity': 1,
        },
        filter: ['==', ['id'], selectedSiteId || -1],
      });

      // Click Event on Sites
      map.on('click', fillLayerId, (e) => {
        if (!e.features || e.features.length === 0) return;
        const feature = e.features[0];
        const siteId = feature.id as number;
        if (siteId) {
          onSelectSite(siteId);
        }
      });

      // Hover Tooltip
      popupRef.current = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        className: 'darukaa-map-popup',
      });

      map.on('mouseenter', fillLayerId, (e) => {
        map.getCanvas().style.cursor = 'pointer';
        if (!e.features || e.features.length === 0) return;
        const feature = e.features[0];
        const props = feature.properties as any;

        const coordinates = e.lngLat;
        const html = `
          <div style="padding: 6px 10px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; color: #fff; background: #12191d; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;">
            <div style="font-weight: 700; color: #10b981; margin-bottom: 2px;">${props.name || 'Site'}</div>
            <div style="color: #94a3b8; font-size: 11px;">Code: <strong style="color: #fff;">${props.code}</strong></div>
            <div style="color: #94a3b8; font-size: 11px;">Area: <strong style="color: #fff;">${props.area_hectares} ha</strong></div>
            <div style="color: #94a3b8; font-size: 11px;">Carbon Stock: <strong style="color: #fff;">${props.total_carbon_stock || 0} tCO2e</strong></div>
            <div style="color: #94a3b8; font-size: 11px;">Canopy: <strong style="color: #fff;">${props.canopy_cover_pct}%</strong></div>
          </div>
        `;

        popupRef.current?.setLngLat(coordinates).setHTML(html).addTo(map);
      });

      map.on('mouseleave', fillLayerId, () => {
        map.getCanvas().style.cursor = '';
        popupRef.current?.remove();
      });
    }

    // Update highlight filter
    if (map.getLayer(highlightLayerId)) {
      map.setFilter(highlightLayerId, ['==', ['id'], selectedSiteId || -1]);
    }
  }, [sitesGeoJSON, selectedSiteId, mapLoaded, onSelectSite]);

  // Zoom to selected site or active project bounds
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !sitesGeoJSON.features.length) return;

    if (selectedSiteId) {
      const selectedFeature = sitesGeoJSON.features.find((f) => f.id === selectedSiteId);
      if (selectedFeature && selectedFeature.geometry) {
        const bbox = turf.bbox(selectedFeature as any) as [number, number, number, number];
        map.fitBounds(bbox, { padding: 80, maxZoom: 14, duration: 1500 });
      }
    } else if (sitesGeoJSON.features.length > 0) {
      // Zoom to all features
      try {
        const bbox = turf.bbox(sitesGeoJSON as any) as [number, number, number, number];
        map.fitBounds(bbox, { padding: 70, maxZoom: 8, duration: 1000 });
      } catch (err) {
        // Safe fallback
      }
    }
  }, [selectedSiteId, activeProjectId, mapLoaded, sitesGeoJSON]);

  return (
    <div className="map-container">
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Map Style & Drawing Controls Bar */}
      <div className="map-controls-panel">
        {/* Layer Style Switcher */}
        <div
          className="glass-card"
          style={{
            padding: '0.5rem',
            display: 'flex',
            gap: '0.35rem',
            backgroundColor: 'var(--bg-card-glass-high)',
          }}
        >
          {(['dark', 'satellite', 'outdoors', 'light'] as const).map((styleKey) => (
            <button
              key={styleKey}
              onClick={() => handleStyleChange(styleKey)}
              className="btn btn-sm"
              style={{
                padding: '0.35rem 0.65rem',
                fontSize: '0.75rem',
                textTransform: 'capitalize',
                backgroundColor: mapStyle === styleKey ? 'var(--primary)' : 'transparent',
                color: mapStyle === styleKey ? '#fff' : 'var(--text-muted)',
              }}
            >
              {styleKey}
            </button>
          ))}
        </div>

        {/* Draw Polygon Action */}
        <div
          className="glass-card"
          style={{
            padding: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            backgroundColor: 'var(--bg-card-glass-high)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <PenTool size={14} color="var(--primary)" />
              Polygon MRV
            </span>
            {drawnHectares !== null && (
              <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>
                {drawnHectares} ha
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={startDrawingPolygon}
              className="btn btn-primary btn-sm"
              style={{ flex: 1, fontSize: '0.75rem' }}
              title="Click on the map to place polygon vertices"
            >
              <PenTool size={14} />
              Draw Parcel
            </button>
            {drawnHectares !== null && (
              <button
                onClick={clearDrawing}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.4rem', color: 'var(--accent-danger)' }}
                title="Clear drawn boundary"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>

          {drawnHectares !== null && (
            <div
              style={{
                fontSize: '0.75rem',
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.5rem',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <CheckCircle2 size={14} />
              Boundary closed! Save parcel below.
            </div>
          )}
        </div>
      </div>

      {/* Map Legend Overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: '1.5rem',
          left: '1.5rem',
          zIndex: 20,
          background: 'var(--bg-card-glass-high)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '0.65rem 1rem',
          fontSize: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Site Threat Status:</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10b981' }} />
          <span>Low</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
          <span>Moderate</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ef4444' }} />
          <span>Critical</span>
        </div>
      </div>
    </div>
  );
};
