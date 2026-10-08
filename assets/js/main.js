/**
 * NSX Monitor - Website Main Script
 * Handles smooth scrolling, dynamic version resolution, installer asset URLs, and OS detection.
 */

const CONFIG = {
  defaultVersion: '0.1.12',
  repoOwner: 'ichshakib',
  repoName: 'nsx_monitor',
  platforms: {
    windows: {
      rowId: 'row-windows',
      pkgId: 'pkg-windows',
      btnId: 'dl-windows',
      filename: (v) => `NSX-Monitor-Windows-${v}-Setup.exe`,
    },
    mac: {
      rowId: 'row-mac',
      pkgId: 'pkg-mac',
      btnId: 'dl-mac',
      filename: (v) => `NSX-Monitor-Mac-${v}-Installer.dmg`,
    },
    linux: {
      rowId: 'row-linux',
      pkgId: 'pkg-linux',
      btnId: 'dl-linux',
      filename: (v) => `NSX-Monitor-Linux-${v}.AppImage`,
    },
  },
}

/**
 * Builds direct download URL for a given version tag and artifact filename.
 */
function buildDownloadUrl(version, filename) {
  return `https://github.com/${CONFIG.repoOwner}/${CONFIG.repoName}/releases/download/v${version}/${filename}`
}

/**
 * Updates all version badges, package file names, and download links across the website.
 */
function applyReleaseVersion(rawVersion) {
  if (!rawVersion) return
  const version = rawVersion.replace(/^v/i, '').trim()

  // Update title
  document.title = `NSX Monitor - High-Precision Network Bandwidth Utility (v${version})`

  // Update text elements displaying the version
  document.querySelectorAll('[data-app-version]').forEach((el) => {
    el.textContent = version
  })
  document.querySelectorAll('[data-app-version-tag]').forEach((el) => {
    el.textContent = `v${version}`
  })

  // Update each platform's package name and download button URL
  Object.keys(CONFIG.platforms).forEach((platformKey) => {
    const platform = CONFIG.platforms[platformKey]
    const filename = platform.filename(version)
    const downloadUrl = buildDownloadUrl(version, filename)

    const pkgElem = document.getElementById(platform.pkgId)
    if (pkgElem) {
      pkgElem.textContent = filename
    }

    const btnElem = document.getElementById(platform.btnId)
    if (btnElem) {
      btnElem.href = downloadUrl
      btnElem.setAttribute('download', filename)
    }
  })
}

/**
 * Checks GitHub Releases API for the latest published tag and updates the links dynamically.
 */
async function fetchLatestRelease() {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${CONFIG.repoOwner}/${CONFIG.repoName}/releases/latest`,
      { headers: { Accept: 'application/vnd.github.v3+json' } }
    )
    if (!response.ok) return
    const releaseData = await response.json()
    if (releaseData && releaseData.tag_name) {
      applyReleaseVersion(releaseData.tag_name)
    }
  } catch (_err) {
    // Graceful fallback: default configured version already active
  }
}

/**
 * Detects visitor OS and highlights the recommended package row.
 */
function detectAndHighlightOS() {
  const ua = (navigator.userAgent || '').toLowerCase()
  const platform = (navigator.platform || '').toLowerCase()

  let detected = null
  if (platform.includes('win') || ua.includes('windows')) {
    detected = 'windows'
  } else if (platform.includes('mac') || ua.includes('macintosh') || ua.includes('mac os')) {
    detected = 'mac'
  } else if (platform.includes('linux') || ua.includes('linux')) {
    detected = 'linux'
  }

  if (detected && CONFIG.platforms[detected]) {
    const row = document.getElementById(CONFIG.platforms[detected].rowId)
    if (row) {
      row.classList.add('highlight-os')
      const firstCell = row.querySelector('td')
      if (firstCell && !firstCell.querySelector('.os-badge')) {
        const badge = document.createElement('span')
        badge.className = 'os-badge'
        badge.textContent = 'Detected OS'
        firstCell.appendChild(badge)
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Apply initial default version
  applyReleaseVersion(CONFIG.defaultVersion)

  // Attempt to resolve latest release from GitHub API
  fetchLatestRelease()

  // Detect OS for row highlight
  detectAndHighlightOS()

  // Smooth scroll for in-page anchors
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href')
      if (targetId === '#') return

      const target = document.querySelector(targetId)
      if (target) {
        e.preventDefault()
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }
    })
  })
})
