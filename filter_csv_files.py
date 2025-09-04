import pandas as pd
import os
from datetime import datetime

def filter_csv_by_last_seen(input_file, output_file):
    """
    Filtra un archivo CSV eliminando registros con 'Last Seen' anterior a 2024
    """
    print(f"Procesando {input_file}...")
    
    # Leer el archivo CSV
    df = pd.read_csv(input_file)
    
    print(f"Registros originales: {len(df)}")
    
    # Mostrar algunas fechas para debug
    print("Primeras 5 fechas 'Last Seen':")
    print(df['Last Seen'].head())
    
    # Filtrar registros que tengan 'Last Seen' que NO comience con '2023'
    # Esto es más directo que convertir a datetime
    df_filtered = df[~df['Last Seen'].astype(str).str.startswith('2023')]
    
    print(f"Registros después del filtro: {len(df_filtered)}")
    print(f"Registros eliminados: {len(df) - len(df_filtered)}")
    
    # Mostrar algunos registros eliminados para verificación
    eliminated = df[df['Last Seen'].astype(str).str.startswith('2023')]
    if len(eliminated) > 0:
        print("Ejemplos de registros eliminados (primeros 3):")
        for idx, row in eliminated.head(3).iterrows():
            print(f"  - Línea {idx+2}: Last Seen = {row['Last Seen']}")
    
    # Guardar el archivo filtrado
    df_filtered.to_csv(output_file, index=False)
    print(f"Archivo guardado como: {output_file}")
    print()

def main():
    # Rutas de los archivos
    brand_manufacturer_file = r"c:\Users\dany2\Downloads\avent\avent\public\Pathmathics_Brand_Manufacturer_plus_focus.csv"
    dme_file = r"c:\Users\dany2\Downloads\avent\avent\public\Pathmatics_DME_plus_focus.csv"
    
    # Crear copias de respaldo solo si no existen
    brand_backup = brand_manufacturer_file.replace('.csv', '_backup.csv')
    dme_backup = dme_file.replace('.csv', '_backup.csv')
    
    import shutil
    if not os.path.exists(brand_backup):
        print("Creando copia de respaldo para Brand Manufacturer...")
        shutil.copy2(brand_manufacturer_file, brand_backup)
        print(f"Respaldo creado: {brand_backup}")
    
    if not os.path.exists(dme_backup):
        print("Creando copia de respaldo para DME...")
        shutil.copy2(dme_file, dme_backup)
        print(f"Respaldo creado: {dme_backup}")
    
    print()
    
    # Filtrar ambos archivos
    filter_csv_by_last_seen(brand_manufacturer_file, brand_manufacturer_file)
    filter_csv_by_last_seen(dme_file, dme_file)
    
    print("¡Filtrado completado!")
    print("Los archivos originales han sido actualizados.")
    print("Las copias de respaldo están disponibles en caso de necesitarlas.")

if __name__ == "__main__":
    main()