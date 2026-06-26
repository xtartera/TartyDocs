---
title: Sistemes de fitxers – NTFS, FAT32, ReFS
tags:
  - instal·lació
  - sistemes de fitxers
  - NTFS
  - UT1
---

# :material-file-cabinet: Sistemes de fitxers – NTFS, FAT32, ReFS

!!! abstract "Concepte clau"
    El sistema de fitxers defineix com s'organitzen i s'accedeix als fitxers en un disc. **NTFS** és l'estàndard per a servidors Windows perquè suporta permisos de seguretat, xifratge i fitxers grans. FAT32 i ReFS tenen usos específics.

=== ":material-notebook-outline: Apunts"

    ## Per què importa el sistema de fitxers?

    El **sistema de fitxers** (FS, filesystem) és la capa de programari que gestiona com es guarden, organitzen i recuperen els fitxers en un dispositiu d'emmagatzematge. La tria del FS determina:

    - La mida màxima de fitxer i de partició
    - Si es poden assignar permisos de seguretat (ACLs)
    - La tolerància a errors i la recuperació d'accidents
    - La compatibilitat amb altres sistemes operatius

    ## FAT32

    **FAT32** (File Allocation Table 32 bits) és el sistema de fitxers més antic i compatible, creat per MS-DOS i usat en discos extraïbles.

    | Característica | Valor |
    |----------------|-------|
    | Mida màxima de fitxer | **4 GB** |
    | Mida màxima de partició | 2 TB (teoria) · 32 GB (Windows format GUI) |
    | Permisos de seguretat (ACL) | **No** |
    | Xifratge (EFS) | **No** |
    | Journaling | **No** |
    | Compatibilitat | Molt alta (Windows, macOS, Linux, consoles) |

    **Ús recomanat**: dispositius USB, targetes SD, discos d'intercanvi entre sistemes operatius.

    !!! warning "FAT32 al servidor = error greu"
        Si formateges una carpeta compartida del servidor en FAT32, **no podràs assignar permisos NTFS**. Qualsevol usuari del domini podria llegir i modificar tots els fitxers. A més, no podràs emmagatzemar fitxers de més de 4 GB (una ISO de Windows Server ja supera aquest límit).

    ## NTFS

    **NTFS** (New Technology File System) és el sistema de fitxers natiu de Windows NT i tots els seus successors, incloent Windows Server 2022.

    | Característica | Valor |
    |----------------|-------|
    | Mida màxima de fitxer | 16 TB |
    | Mida màxima de partició | 256 TB |
    | Permisos de seguretat (ACL) | **Sí** ← clau per al curs |
    | Xifratge (EFS) | **Sí** |
    | Journaling | **Sí** (recuperació davant errors) |
    | Quotes de disc | **Sí** |
    | Comprensió transparent | **Sí** |
    | Compatibilitat | Windows (natiu) · Linux (lectura/escriptura amb ntfs-3g) |

    **Ús recomanat**: totes les particions d'un servidor Windows, particions de sistema, carpetes compartides amb permisos.

    ## ReFS

    **ReFS** (Resilient File System) és el sistema de fitxers modern de Microsoft, dissenyat per a emmagatzematge massiu i alta disponibilitat.

    | Característica | Valor |
    |----------------|-------|
    | Mida màxima de fitxer | 35 PB |
    | Tolerància a errors | Alta (checksums automàtics) |
    | Permisos de seguretat (ACL) | **Sí** |
    | Xifratge (EFS) | **No** |
    | Compatibilitat | Només Windows Server / Windows 10 Pro for Workstations |

    **Ús recomanat**: Storage Spaces Direct, volums de còpia de seguretat de gran mida, Hyper-V (VHD/VHDX).

    !!! info "ReFS no és per al curs"
        No treballem ReFS directament. Però has de saber que existeix per entendre per què `C:\` sempre és NTFS i no ReFS (el sistema no pot arrencar des de ReFS).

    ## Comparativa visual

    ```mermaid
    graph LR
        subgraph Ús["Quin FS usar?"]
            Q1{Servidor Windows?}
            Q1 -- Sí --> NTFS[✅ NTFS]
            Q1 -- No --> Q2{USB o SD?}
            Q2 -- Sí --> FAT32[✅ FAT32]
            Q2 -- No --> Q3{Storage Spaces / Backup gran?}
            Q3 -- Sí --> ReFS[✅ ReFS]
            Q3 -- No --> NTFS2[✅ NTFS]
        end
    ```

    ## Conversió de FAT32 a NTFS

    Si un disc o partició és FAT32 i la necessites en NTFS, pots convertir-la **sense perdre dades** amb:

    ```cmd
    convert D: /fs:ntfs
    ```

    !!! warning "La conversió és **unidireccional**: NTFS → FAT32 requereix formatar (pèrdua de dades). Fes sempre una còpia de seguretat prèvia."

    ??? question "Auto-avaluació"

        **1.** Quin sistema de fitxers has d'usar obligatòriament per poder assignar permisos NTFS a una carpeta compartida del servidor?

        ??? success "Resposta"
            **NTFS**. Sense NTFS no hi ha ACLs (llistes de control d'accés) i, per tant, no es poden assignar permisos diferenciats per usuari o grup. FAT32 i exFAT no suporten ACLs.

        **2.** Un usuari vol copiar una ISO de Windows Server 2022 (que pesa 5,4 GB) a un USB formatat en FAT32. Funcionarà? Per quin motiu?

        ??? success "Resposta"
            **No funcionarà**. FAT32 té un límit de **4 GB per fitxer**. La ISO de 5,4 GB supera aquest límit i el sistema operatiu mostrarà un error. La solució és reformatar el USB en **exFAT** o **NTFS** (exFAT és preferit per a USB perquè és més compatible entre plataformes).

        **3.** Quin sistema de fitxers és el més adequat per a la partició `C:\` d'un servidor i per quin motiu no es pot usar ReFS?

        ??? success "Resposta"
            **NTFS**. ReFS no pot ser la partició d'arrencada del sistema: el carregador de Windows (Bootmgr) no pot llegir ReFS. La partició d'arrencada sempre ha de ser NTFS.

=== ":material-pencil-ruler: Activitat"

    ## Activitat 2.3 · Identifica el sistema de fitxers adequat

    **Objectiu**: triar el sistema de fitxers correcte per a cada cas d'ús i verificar-ho al sistema.

    **Temps estimat**: 20 minuts

    ---

    ### Part A – Tria el FS correcte

    | # | Escenari | FS recomanat | Raó principal |
    |---|----------|-------------|---------------|
    | 1 | Partició `C:\` del servidor Windows | | |
    | 2 | Clau USB per intercanviar fitxers entre Windows i Mac | | |
    | 3 | Carpeta compartida amb permisos per departament | | |
    | 4 | Disc extern per a còpies de seguretat de Hyper-V | | |
    | 5 | Targeta SD d'una càmera de fotos | | |

    ### Part B – Comprova el FS de les teves particions

    A la MV de Windows Server, comprova el sistema de fitxers de cada partició:

    ```powershell
    Get-Volume | Select-Object DriveLetter, FileSystemLabel, FileSystem, SizeRemaining, Size
    ```

    Documenta el resultat: quines particions tens i quin FS té cadascuna?

    ### Part C – Simula el problema de FAT32

    1. A VirtualBox, afegeix un disc virtual petit (1 GB) a la teva MV.
    2. Des de `diskmgmt.msc`, inicialitza'l i formata'l en FAT32.
    3. Intenta assignar permisos NTFS a una carpeta d'aquest disc. Qué passa?
    4. Reformata'l en NTFS i torna a intentar-ho. Quina diferència observes?

=== ":material-play-circle-outline: Vídeo"

    ## Recursos audiovisuals

    !!! info "Cerca a YouTube"
        - `"NTFS vs FAT32 vs exFAT diferencias cuando usar"`
        - `"NTFS permissions explained Windows Server"`
        - `"ReFS vs NTFS Windows Server 2022"`
        - `"convert FAT32 to NTFS without losing data"`
