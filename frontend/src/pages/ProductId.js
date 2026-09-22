import React, { useState, useRef, useEffect } from 'react';
// import { useCart } from "../context/CartContext";
import { useParams } from 'react-router-dom';
import API from '../api';

const SeparateSideZoom = ({ width = 600, height = 400 }) => {
  const LENS_SIZE = 140;   // Lens box dimensions (140x140px)
  const ZOOM_LEVEL = 2.5;  // Magnification factor
  const { id } = useParams();
  const [visibleproduct ,setVisibleproduct] =useState(null)
  const [discount ,setDiscount] =useState(null)

 useEffect(() => {
  const getProduct = async () => {
    try {
      const res = await API.get(`/products/productid/${id}`);
      if(res.data.success)
      {
setVisibleproduct(res.data.product);
      }
        
      // }
    } catch (err) {
      console.error(err);
    }
  };

  getProduct();
}, [id]);
useEffect(() => {
  const getdiscount = async () => {
    try {
      const discount = visibleproduct?.comparePrice
    ? Math.round(((visibleproduct?.comparePrice - visibleproduct?.price) / visibleproduct?.comparePrice) * 100)
    : 0;
    setDiscount(discount)
    } catch (err) {
      console.error(err);
    }
  };

  getdiscount();
}, [visibleproduct]);

  const imgRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });


  const handleMouseMove = (e) => {
    if (!imgRef.current) return;

    // Get image dimensions and bounding rect relative to the viewport
    const rect = imgRef.current.getBoundingClientRect();

    // 1. Mouse coordinates relative to the image
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 2. Center the lens box over the mouse cursor
    let lensX = x - LENS_SIZE / 2;
    let lensY = y - LENS_SIZE / 2;

    // 3. Keep the lens inside image boundaries
    const maxLeft = rect.width - LENS_SIZE;
    const maxTop = rect.height - LENS_SIZE;

    if (lensX < 0) lensX = 0;
    if (lensY < 0) lensY = 0;
    if (lensX > maxLeft) lensX = maxLeft;
    if (lensY > maxTop) lensY = maxTop;

    // 4. Update state for the lens position and the background offset for zoom
    setLensPos({ x: lensX, y: lensY });

  };

  return (

    <div className='checkout-page container' style={{ display: 'flex', gap: '20px', padding: "20px" }}>

      {/* ---------------- 1. MAIN IMAGE CONTAINER ---------------- */}
      <div 
        style={{
          position: 'relative',
          width: `${width}px`,
          height: `${height}px`,

        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          ref={imgRef}
          // src={src}
          src={visibleproduct?.imageUrl}
          alt="Main Product"
          style={{ width: '100%', height: '100%', display: 'block' }}
        />

        {/* Square Target Lens Frame (No internal image/zoom) */}
        {isHovered && (
          <div
            style={{
              position: 'absolute',
              top: `${lensPos.y}px`,
              left: `${lensPos.x}px`,
              width: `${LENS_SIZE}px`,
              height: `${LENS_SIZE}px`,
              border: '2px solid #00E5FF',
              backgroundColor: 'rgba(0, 229, 255, 0.15)',
              pointerEvents: 'none',

              // Optional SVG grid lines overlay
              backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0, 229, 255, 0.5)" stroke-width="1"/></svg>')`,
            }}
          />
        )}
      </div>

      {/* ---------------- 2. SEPARATE ZOOM PREVIEW DIV ---------------- */}
      {isHovered ? (
        <div
          style={{
            position: 'relative',
            width: `${LENS_SIZE * ZOOM_LEVEL * 1.5}px`,  // Match scaled ratio or fixed preview box size
            height: `${LENS_SIZE * ZOOM_LEVEL * 1.5}px`,
            overflow: 'hidden',
            border: '2px solid #ccc',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            backgroundColor: '#fff',
          }}
        >
          <img
           src={visibleproduct?.imageUrl}
            alt="Magnified Preview"
            style={{
              position: 'absolute',
              maxWidth: 'none',
              // Scale image to full zoom size
              width: `${width * ZOOM_LEVEL * 1.5}px`,
              height: `${height * ZOOM_LEVEL * 1.5}px`,
              // Shift image negatively based on lens position
              left: `${-lensPos.x * ZOOM_LEVEL * 1.5}px`,
              top: `${-lensPos.y * ZOOM_LEVEL * 1.5}px`,
            }}
          />
        </div>
      ) : (

        <div>
          <h2 className='text-capitalize'>{visibleproduct?.seller.storeName}</h2>
          <span className="-category">{visibleproduct?.category}</span>
          <h3 className="">{visibleproduct?.name}</h3>
          {(discount > 0|| !discount) && <span className="px-2 fw-bold" style={{ color: "red"
            }}>-{discount}%</span>}
           <span className="current-price">{visibleproduct?.price.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</span>
           <br/>
          <span>M.R.P{visibleproduct?.comparePrice > 0 && (
            <span className="compare-price price-distance">{visibleproduct?.comparePrice .toLocaleString("en-IN", { style: "currency", currency: "INR" })}</span>
          )}</span>
          <br/>
          
          <br></br>
          <span className="text-capitalize">{visibleproduct?.description}</span>
        </div>
      )}

    </div>
  );
};

export default SeparateSideZoom;