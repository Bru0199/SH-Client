import { useEffect, useMemo } from 'react'
import { ImagePlus } from 'lucide-react'

const ImagePicker = ({ label, value, file, onChange }) => {
  const preview = useMemo(() => {
    if (file) {
      return URL.createObjectURL(file)
    }
    return value || ''
  }, [file, value])

  useEffect(() => {
    if (!file || !preview) return undefined
    return () => URL.revokeObjectURL(preview)
  }, [file, preview])

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0]
    if (!nextFile) return
    onChange({ url: '', file: nextFile })
  }

  return (
    <div className="form-group">
      {label && <label>{label}</label>}
      <div className="image-picker">
        <input
          className="input"
          placeholder="Paste image URL"
          value={value || ''}
          onChange={(event) => onChange({ url: event.target.value, file: null })}
        />
        <label className="button ghost image-upload">
          <ImagePlus size={16} />
          Upload
          <input type="file" accept="image/*" onChange={handleFileChange} hidden />
        </label>
      </div>
      {preview && (
        <div className="image-preview">
          <img src={preview} alt="Preview" />
        </div>
      )}
    </div>
  )
}

export default ImagePicker
