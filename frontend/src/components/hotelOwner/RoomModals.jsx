import React from 'react';
import { assets } from '../../assets/assets';

export const AddRoomModal = ({
  show,
  onClose,
  addLoading,
  onSubmit,
  addImages,
  setAddImages,
  addInputs,
  setAddInputs,
  currency,
  addSelectedAmenities,
  allAvailableAmenitiesForAdd,
  handleToggleAddAmenity,
  addCustomAmenity,
  setAddCustomAmenity,
  handleAddCustomAmenityToAddModal,
  showSeasonSection,
  setShowSeasonSection,
  addSeasonalPricing,
  newSeason,
  setNewSeason,
  handleAddSeason,
  handleRemoveSeason,
}) => {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !addLoading) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-gray-900 font-outfit">
              Thêm Phòng Mới & Thiết Lập Giá
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Điền đầy đủ thông tin phòng, mức giá tiêu chuẩn và tiện nghi để đăng tải ngay.
            </p>
          </div>
          <button
            type="button"
            onClick={() => !addLoading && onClose()}
            disabled={addLoading}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Form Body */}
        <form
          id="add-room-form"
          onSubmit={onSubmit}
          className="p-6 space-y-5 overflow-y-auto flex-1 text-left"
        >
          {/* Hình ảnh phòng */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Hình ảnh phòng (Tối đa 4 ảnh, ít nhất 1 ảnh) <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-1">
              {[1, 2, 3, 4].map((key) => (
                <div key={key} className="relative group">
                  <label htmlFor={`newRoomImageSlot${key}`} className="cursor-pointer block">
                    <div className="w-full aspect-square rounded-xl overflow-hidden border-2 border-dashed border-gray-300 group-hover:border-blue-500 bg-gray-50 flex flex-col items-center justify-center p-2 text-center transition-colors">
                      {addImages[key] ? (
                        <img
                          src={URL.createObjectURL(addImages[key])}
                          alt={`Ảnh ${key}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <svg
                            className="w-6 h-6 mb-1 text-gray-400 group-hover:text-blue-500 transition-colors"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="text-[11px] font-medium text-gray-500">Ảnh {key}</span>
                          {key === 1 && (
                            <span className="text-[9px] text-red-500 font-semibold">*Bắt buộc</span>
                          )}
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      id={`newRoomImageSlot${key}`}
                      hidden
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setAddImages((prev) => ({ ...prev, [key]: e.target.files[0] }));
                        }
                      }}
                    />
                  </label>
                  {addImages[key] && (
                    <button
                      type="button"
                      onClick={() => setAddImages((prev) => ({ ...prev, [key]: null }))}
                      className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700 shadow"
                      title="Xóa ảnh"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Loại phòng & Sức chứa */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Loại phòng / Tên phòng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                list="new-room-types-list"
                value={addInputs.roomType}
                onChange={(e) => {
                  const val = e.target.value;
                  let defaultMax = addInputs.maxGuests;
                  if (val === 'Phòng đơn') defaultMax = 1;
                  else if (val === 'Phòng đôi') defaultMax = 2;
                  else if (val === 'Căn hộ gia đình') defaultMax = 4;
                  else if (val === 'Phòng cao cấp') defaultMax = 3;
                  setAddInputs((prev) => ({
                    ...prev,
                    roomType: val,
                    maxGuests: defaultMax,
                  }));
                }}
                placeholder="VD: Deluxe King Room, Phòng Đôi Ban Công..."
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <datalist id="new-room-types-list">
                <option value="Phòng đơn" />
                <option value="Phòng đôi" />
                <option value="Phòng cao cấp" />
                <option value="Căn hộ gia đình" />
                <option value="Deluxe King Room" />
                <option value="Phòng Suite Hướng Núi" />
                <option value="Villa Biệt Thự Hồ Bơi" />
              </datalist>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Sức chứa tối đa <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="30"
                  required
                  value={addInputs.maxGuests}
                  onChange={(e) =>
                    setAddInputs((prev) => ({
                      ...prev,
                      maxGuests: Math.max(1, parseInt(e.target.value, 10) || 1),
                    }))
                  }
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-gray-400 pointer-events-none">
                  khách
                </span>
              </div>
            </div>
          </div>

          {/* Giá tiêu chuẩn */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Giá tiêu chuẩn mỗi đêm ({currency}) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="10000"
              step="10000"
              required
              value={addInputs.pricePerNight}
              onChange={(e) =>
                setAddInputs((prev) => ({ ...prev, pricePerNight: e.target.value }))
              }
              placeholder="VD: 500000"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-semibold"
            />
            {Number(addInputs.pricePerNight) > 0 && (
              <p className="text-xs text-blue-600 font-medium">
                {Number(addInputs.pricePerNight).toLocaleString('vi-VN')} {currency} / đêm
              </p>
            )}
          </div>

          {/* Tiện nghi phòng */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Tiện nghi phòng ({addSelectedAmenities.length} đã chọn) <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-gray-400">Nhấp để bật / tắt tiện nghi</span>
            </div>

            <div className="flex flex-wrap gap-1.5 p-3 bg-gray-50 rounded-xl border border-gray-200 max-h-40 overflow-y-auto">
              {allAvailableAmenitiesForAdd.map((amenity) => {
                const isSelected = addSelectedAmenities.includes(amenity);
                return (
                  <button
                    type="button"
                    key={amenity}
                    onClick={() => handleToggleAddAmenity(amenity)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {isSelected ? `✓ ${amenity}` : `+ ${amenity}`}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={addCustomAmenity}
                onChange={(e) => setAddCustomAmenity(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomAmenityToAddModal();
                  }
                }}
                placeholder="Nhập thêm tiện nghi khác nếu có..."
                className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleAddCustomAmenityToAddModal}
                className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg transition-colors whitespace-nowrap"
              >
                + Thêm tiện nghi
              </button>
            </div>
          </div>

          {/* Bảng giá theo mùa (Tùy chọn) */}
          <div className="pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowSeasonSection(!showSeasonSection)}
              className="flex items-center justify-between w-full text-left py-2 text-xs font-semibold text-gray-700 hover:text-blue-600 transition-colors"
            >
              <span className="uppercase tracking-wider">
                Thiết lập giá theo mùa / dịp lễ ({addSeasonalPricing.length} đợt đã thêm)
              </span>
              <span className="text-gray-400 font-normal">
                {showSeasonSection ? '▲ Ẩn bớt' : '▼ Mở rộng'}
              </span>
            </button>

            {showSeasonSection && (
              <div className="mt-2 p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-3">
                <p className="text-xs text-gray-600">
                  Thiết lập giá riêng cho các đợt cao điểm, ngày lễ Tết hoặc cuối tuần. Khách đặt trong khoảng này sẽ tự động áp dụng giá mùa.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="Tên đợt (VD: Mùa Hè)"
                    value={newSeason.name}
                    onChange={(e) => setNewSeason((prev) => ({ ...prev, name: e.target.value }))}
                    className="border border-gray-300 rounded-lg p-2 text-xs bg-white"
                  />
                  <input
                    type="date"
                    value={newSeason.startDate}
                    onChange={(e) => setNewSeason((prev) => ({ ...prev, startDate: e.target.value }))}
                    className="border border-gray-300 rounded-lg p-2 text-xs bg-white"
                  />
                  <input
                    type="date"
                    value={newSeason.endDate}
                    min={newSeason.startDate}
                    onChange={(e) => setNewSeason((prev) => ({ ...prev, endDate: e.target.value }))}
                    className="border border-gray-300 rounded-lg p-2 text-xs bg-white"
                  />
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      placeholder={`Giá (${currency})`}
                      value={newSeason.pricePerNight}
                      onChange={(e) => setNewSeason((prev) => ({ ...prev, pricePerNight: e.target.value }))}
                      className="border border-gray-300 rounded-lg p-2 text-xs bg-white w-full"
                    />
                    <button
                      type="button"
                      onClick={handleAddSeason}
                      className="px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs whitespace-nowrap"
                    >
                      + Thêm
                    </button>
                  </div>
                </div>

                {addSeasonalPricing.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-amber-200">
                    {addSeasonalPricing.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-amber-200 text-xs"
                      >
                        <div>
                          <strong className="text-gray-900">{item.name}</strong>: {item.startDate} đến {item.endDate}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-amber-700">
                            {Number(item.pricePerNight).toLocaleString('vi-VN')} {currency} / đêm
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSeason(idx)}
                            className="text-red-500 hover:text-red-700 font-bold"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={addLoading}
            className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            form="add-room-form"
            disabled={addLoading}
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            {addLoading && (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            <span>{addLoading ? 'Đang tạo phòng...' : 'Lưu & Đăng Phòng'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const EditRoomModal = ({
  editingRoom,
  onClose,
  saving,
  onSubmit,
  editForm,
  setEditForm,
  currency,
  allAvailableAmenitiesForEdit,
  handleToggleAmenity,
  customAmenity,
  setCustomAmenity,
  handleAddCustomAmenity,
  newImages,
  handleImageChange,
}) => {
  if (!editingRoom) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-gray-900 font-outfit">
              Chỉnh Sửa Thông Tin Phòng
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Mã phòng: #{String(editingRoom.id || editingRoom._id).slice(-6).toUpperCase()}
            </p>
          </div>
          <button
            type="button"
            onClick={() => !saving && onClose()}
            disabled={saving}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Form Body */}
        <form
          id="edit-room-form"
          onSubmit={onSubmit}
          className="p-6 space-y-5 overflow-y-auto flex-1 text-left"
        >
          {/* Tên loại phòng & Sức chứa */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Loại phòng / Tên phòng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={editForm.roomType}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, roomType: e.target.value }))
                }
                placeholder="VD: Deluxe King Room, Phòng Gia Đình..."
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Sức chứa tối đa <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="30"
                  required
                  value={editForm.maxGuests}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      maxGuests: Math.max(1, parseInt(e.target.value, 10) || 1),
                    }))
                  }
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-gray-400 pointer-events-none">
                  khách
                </span>
              </div>
            </div>
          </div>

          {/* Giá mỗi đêm & Trạng thái nhận khách */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Giá mỗi đêm ({currency}) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="10000"
                step="10000"
                required
                value={editForm.pricePerNight}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, pricePerNight: e.target.value }))
                }
                placeholder="VD: 500000"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-semibold"
              />
              {Number(editForm.pricePerNight) > 0 && (
                <p className="text-xs text-blue-600 font-medium">
                  {Number(editForm.pricePerNight).toLocaleString('vi-VN')} {currency} / đêm
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Trạng thái đón khách
              </label>
              <div className="flex items-center gap-3 pt-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isAvailable}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, isAvailable: e.target.checked }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${
                    editForm.isAvailable
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                >
                  {editForm.isAvailable ? 'Đang mở nhận khách' : 'Tạm khóa nhận'}
                </span>
              </div>
            </div>
          </div>

          {/* Tiện nghi phòng */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Tiện nghi phòng ({editForm.amenities.length} đã chọn)
              </label>
              <span className="text-[11px] text-gray-400">Nhấp để bật / tắt tiện nghi</span>
            </div>

            <div className="flex flex-wrap gap-1.5 p-3 bg-gray-50 rounded-xl border border-gray-200 max-h-40 overflow-y-auto">
              {allAvailableAmenitiesForEdit.map((amenity) => {
                const isSelected = editForm.amenities.includes(amenity);
                return (
                  <button
                    type="button"
                    key={amenity}
                    onClick={() => handleToggleAmenity(amenity)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {isSelected ? `✓ ${amenity}` : `+ ${amenity}`}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={customAmenity}
                onChange={(e) => setCustomAmenity(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomAmenity();
                  }
                }}
                placeholder="Nhập thêm tiện nghi khác nếu có..."
                className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleAddCustomAmenity}
                className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg transition-colors whitespace-nowrap"
              >
                + Thêm tiện nghi
              </button>
            </div>
          </div>

          {/* Ảnh phòng hiện tại & Tải ảnh mới */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Hình ảnh phòng
            </label>

            {editingRoom.images && editingRoom.images.length > 0 && (
              <div>
                <p className="text-[11px] text-gray-500 mb-1.5">Ảnh hiện tại:</p>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {editingRoom.images.map((imgUrl, i) => (
                    <div
                      key={i}
                      className="relative w-16 h-14 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 bg-gray-100"
                    >
                      <img
                        src={imgUrl}
                        alt={`Ảnh phòng ${i + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = assets.roomImg1;
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-1">
              <p className="text-[11px] text-gray-500 mb-1.5">
                Tải ảnh mới thay thế (tối đa 4 ảnh, tùy chọn):
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-gray-300 rounded-xl"
              />
              {newImages.length > 0 && (
                <p className="text-xs text-emerald-600 mt-1.5 font-medium">
                  Đã chọn {newImages.length} ảnh mới để tải lên.
                </p>
              )}
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            form="edit-room-form"
            disabled={saving}
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            {saving && (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            <span>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
