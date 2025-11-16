package captcha

import (
	"github.com/wenlng/go-captcha-assets/resources/imagesv2"
	"github.com/wenlng/go-captcha-assets/resources/tiles"
	"github.com/wenlng/go-captcha/v2/slide"
)

func NewSlideCaptcha() slide.Captcha {
	builder := slide.NewBuilder(
		slide.WithGenGraphNumber(1),
	)

	imgs, err := imagesv2.GetImages()
	if err != nil {
		panic(err)
	}

	graphs, err := tiles.GetTiles()
	if err != nil {
		panic(err)
	}

	var newGraphs = make([]*slide.GraphImage, 0, len(graphs))
	for _, g := range graphs {
		newGraphs = append(newGraphs, &slide.GraphImage{
			MaskImage:    g.MaskImage,
			OverlayImage: g.OverlayImage,
			ShadowImage:  g.ShadowImage,
		})
	}

	builder.SetResources(
		slide.WithGraphImages(newGraphs),
		slide.WithBackgrounds(imgs),
	)
	return builder.Make()
}
