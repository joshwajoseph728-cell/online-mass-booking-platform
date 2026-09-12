// Public About Church Page

import { renderNavbar, attachNavbarEvents } from '../../components/Navbar.js';
import { renderFooter } from '../../components/Footer.js';
import { CHURCH_DETAILS } from '../../config/constants.js';
import { firestoreService } from '../../services/firestoreService.js';

export async function renderAboutPage() {
  const priests = await firestoreService.getCollection('priests');

  const html = `
    ${renderNavbar('/about')}

    <!-- Page Header Banner -->
    <section class="section section-alt" style="padding: 4rem 0 3rem; text-align: center; border-bottom: 1px solid var(--border-subtle);">
      <div class="container">
        <span class="section-eyebrow">Centenary Parish History & Clergy</span>
        <h1 class="church-title" style="font-size: 2.85rem; margin-bottom: 0.75rem;">About Our Parish</h1>
        <p style="max-width: 620px; margin: 0 auto; color: var(--text-secondary); font-size: 1.05rem;">
          Established in 1896, Our Lady of Dolours has nurtured generations of faithful in prayer, Eucharistic devotion, and compassionate community service.
        </p>
      </div>
    </section>

    <!-- 1. PARISH HISTORY & PATRON SAINT -->
    <section class="section">
      <div class="container">
        <div class="two-col-feature-grid">
          <div>
            <span class="section-eyebrow">Heritage & Roots</span>
            <h2 class="section-title">A Historic Beacon of Catholic Faith</h2>
            <p>
              Founded in the late 19th century under the Archdiocese of Verapoly, Our Lady of Dolours began as a humble chapel for Catholic civil servants, soldiers, and local families in Trivandrum. 
            </p>
            <p>
              Over the decades, the church was expanded into a magnificent Gothic-revival sanctuary featuring soaring vaulted arches, sacred stained glass imported from Europe, and an imposing bell tower that continues to chime the Angelus three times daily.
            </p>
            <p>
              Today, our parish comprises more than 850 families divided into 18 active Family Units (Kudumba Kootayma), united in continuous prayer, weekly Eucharistic adoration, and charitable outreach.
            </p>
          </div>
          <div>
            <div class="card card-gold-border" style="padding: 2rem; background: var(--bg-surface-elevated);">
              <div style="font-size: 2rem; color: var(--gold-accent); margin-bottom: 0.75rem;">🌹</div>
              <h3 style="font-size: 1.35rem; margin-bottom: 0.5rem; color: var(--primary-navy);">Patroness: Mater Dolorosa</h3>
              <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6;">
                Our parish is consecrated to Our Lady of Seven Sorrows. We contemplate Mary’s deep maternal compassion at the foot of the Cross, drawing courage from her unconditional faith and trusting in her powerful heavenly intercession.
              </p>
              <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-medium); font-size: 0.85rem; font-weight: 700; color: var(--gold-accent-hover);">
                Annual Patronal Feast: September 15th
              </div>
            </div>
          </div>
        </div>

        <!-- 2. PARISH CLERGY DIRECTORY -->
        <div class="section-header" style="margin-bottom: 2.5rem;">
          <span class="section-eyebrow">Pastoral Leadership</span>
          <h2 class="section-title">Our Parish Clergy</h2>
          <p class="section-desc">Meet the dedicated priests serving the spiritual and sacramental needs of our community.</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-bottom: 4.5rem;">
          ${priests.map(p => `
            <div class="card" style="text-align: center; padding: 2rem 1.5rem;">
              <img 
                src="${p.photoURL || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300'}" 
                alt="${p.name}" 
                style="width: 110px; height: 110px; border-radius: var(--radius-full); object-fit: cover; margin: 0 auto 1.25rem; border: 3px solid var(--gold-accent);"
              />
              <h4 style="font-size: 1.2rem; margin-bottom: 0.25rem;">${p.name}</h4>
              <span style="display: inline-block; font-size: 0.8rem; font-weight: 700; color: var(--primary-navy); text-transform: uppercase; margin-bottom: 0.75rem;">
                ${p.designation || 'Parish Priest'}
              </span>
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
                Ordination: ${p.ordinationYear || '2004'} &bull; Diocese of Verapoly
              </p>
              <div style="font-size: 0.8rem; color: var(--text-secondary); padding: 0.75rem; background: var(--bg-surface-alt); border-radius: var(--radius-md);">
                📞 ${p.phone || CHURCH_DETAILS.phone}<br>
                ✉️ ${p.email || CHURCH_DETAILS.email}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- 3. PARISH MINISTRIES -->
        <div class="section-header">
          <span class="section-eyebrow">Active Community</span>
          <h2 class="section-title">Pious Associations & Ministries</h2>
          <p class="section-desc">Get involved and grow together through active participation in church life.</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem;">
          <div class="card" style="padding: 1.5rem;">
            <div style="font-size: 1.75rem; margin-bottom: 0.5rem;">🥖</div>
            <h4 style="font-size: 1.05rem; margin-bottom: 0.35rem;">St. Vincent de Paul Society</h4>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0;">Weekly visits and sustenance aid to poor, bedridden, and elderly families in the parish.</p>
          </div>
          <div class="card" style="padding: 1.5rem;">
            <div style="font-size: 1.75rem; margin-bottom: 0.5rem;">🙏</div>
            <h4 style="font-size: 1.05rem; margin-bottom: 0.35rem;">Legion of Mary</h4>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0;">Marian devotion, Rosary recitation, hospital visits, and evangelization ministry.</p>
          </div>
          <div class="card" style="padding: 1.5rem;">
            <div style="font-size: 1.75rem; margin-bottom: 0.5rem;">🎶</div>
            <h4 style="font-size: 1.05rem; margin-bottom: 0.35rem;">Parish Choir & Music</h4>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0;">Leading solemn liturgical hymns in English, Malayalam, and sacred Latin plainchant.</p>
          </div>
          <div class="card" style="padding: 1.5rem;">
            <div style="font-size: 1.75rem; margin-bottom: 0.5rem;">📖</div>
            <h4 style="font-size: 1.05rem; margin-bottom: 0.35rem;">Sunday Catechism</h4>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0;">Faith formation and sacramental preparation for over 300 parish children every Sunday.</p>
          </div>
        </div>
      </div>
    </section>

    ${renderFooter()}
  `;

  return html;
}

export function attachAboutPageEvents(router) {
  attachNavbarEvents(router);
}
