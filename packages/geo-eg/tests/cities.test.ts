import { describe, it, expect } from 'vitest'
import { EG_CITIES, getAreasByCity, getAllCities } from '../src/cities'

describe('Egypt Cities', () => {
  describe('EG_CITIES', () => {
    it('should have Cairo as the first city', () => {
      expect(EG_CITIES[0].name).toBe('Cairo')
    })

    it('should have Alexandria as the second city', () => {
      expect(EG_CITIES[1].name).toBe('Alexandria')
    })

    it('should have Zamalek in Cairo areas', () => {
      const cairo = EG_CITIES.find(city => city.name === 'Cairo')
      expect(cairo?.areas).toContain('Zamalek')
    })

    it('should have Smouha in Alexandria areas', () => {
      const alexandria = EG_CITIES.find(city => city.name === 'Alexandria')
      expect(alexandria?.areas).toContain('Smouha')
    })

    it('should have at least 20 cities', () => {
      expect(EG_CITIES.length).toBeGreaterThanOrEqual(20)
    })

    it('should have areas for each city', () => {
      EG_CITIES.forEach(city => {
        expect(city.areas.length).toBeGreaterThan(0)
      })
    })
  })

  describe('getAreasByCity', () => {
    it('should return Cairo areas for Cairo', () => {
      const areas = getAreasByCity('Cairo')
      expect(areas).toContain('Zamalek')
      expect(areas).toContain('Nasr City')
      expect(areas).toContain('Heliopolis')
    })

    it('should return Alexandria areas for Alexandria', () => {
      const areas = getAreasByCity('Alexandria')
      expect(areas).toContain('Smouha')
      expect(areas).toContain('Roushdy')
      expect(areas).toContain('San Stefano')
    })

    it('should return empty array for unknown city', () => {
      const areas = getAreasByCity('Unknown City')
      expect(areas).toEqual([])
    })
  })

  describe('getAllCities', () => {
    it('should return all city names', () => {
      const cities = getAllCities()
      expect(cities).toContain('Cairo')
      expect(cities).toContain('Alexandria')
      expect(cities).toContain('Giza')
      expect(cities.length).toBe(EG_CITIES.length)
    })
  })
})
