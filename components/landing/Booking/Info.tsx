export const Info = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-10">
    <div className="flex flex-col md:flex-row justify-between items-start mb-16 max-w-5xl mx-auto font-poppins gap-12">
      <div>
        <p
          className="uppercase tracking-wide text-sm mb-2 font-medium"
          style={{ color: "#1A222B" }}
        >
          RESERVAS
        </p>
        <h2
          className="text-4xl font-medium leading-tight"
          style={{
            maxWidth: "480px",
            textAlign: "left",
            color: "#1A222B",
          }}
        >
          Tu lugar en la cima,
          <br />
          asegurado acá!
        </h2>
      </div>

      <p
        className="text-base leading-relaxed max-w-md font-montserrat font-normal mt-4"
        style={{ maxWidth: "500px", textAlign: "left", color: "#1A222B" }}
      >
        Completá el formulario y dejá que la montaña te guarde un lugar.
        Nosotros nos encargamos del fuego, del abrigo y del paisaje... Vos, solo
        traé ganas de desconectar.
      </p>
    </div>
  </div>
);
